#!/usr/bin/env python3
"""
ART PLAYGROUND 共有カード画像(OGP)生成 — SNS/LINE/DMにURLを貼ったときに出るプレビュー画像を作る。

【何を作るか】
- 作品ごと: og/<パスから .html を除き / を __ に置換>.jpg  (1200x630)
    左に作品の姿(472x630)、右に作品名・一言・サイト名の暗いカード。
    例: art-v89-lamp-fold.html → og/art-v89-lamp-fold.jpg
- サイト全体の既定: brand/og-image.jpg (1200x630)
    代表3作品(LAMP FOLD / ANIMAL MANSION / BIRTHMARK)を並べ、キャッチコピーを重ねたもの。
    index.html の og:image はこれ。作品が増えても自動では変わらない(変えたいときだけ --brand)。
- og/manifest.json に「どの作品の・どのファイルの・作品ファイルと文言のハッシュ」を記録する。

【worker.js との1対1の約束】
  worker.js は、公開作品ページ(art-vNN-xxx.html など)が直接開かれたとき(SNSのクローラー含む)に
  <head> へ og:image=/og/<上の名前>.jpg を差し込む。画像の命名規則を変えるなら worker.js の ogImageFor() も直すこと。

【ルール(gen_posters.py と同じ考え方)】
- 対象 = index.html の data-src に載っている全作品(CURRENT + LOG)。
- 作品名 = index.html の openArt('パス','NAME')。一言 = index.html の META の sub、無ければ作品の <title>
  「NAME — 日本語の一言」から(index.html の JS と同じ規則)。
- 撮影は tools/poster-config.json の taps/holds/delay/timeout/hide をポスターと共用する。
  さらに冒頭の操作説明(#hint)とap-kitのUI(ボタン・時計)は全作品で常に隠して撮る。

【使い方】
  python3 tools/gen_og.py                 # 足りない・古い分だけ作る(新作追加後はこれだけ)
  python3 tools/gen_og.py --check         # 作らずに点検。足りない/古いがあれば終了コード1
  python3 tools/gen_og.py --only lamp-fold,holo-compass
  python3 tools/gen_og.py --all           # 全部作り直す
  python3 tools/gen_og.py --brand         # サイト全体の既定画像(brand/og-image.jpg)を作り直す

外部CDN(p5.js)を使う作品(VOID FIELD II / INFECTION)は、CDNに出られない環境では POSTER_LIB_DIR が要る
(gen_posters.py と同じ。p5.min.js を置いたフォルダを指定)。
必要: python3, playwright(+chromium), pillow は不要(合成もChromiumで行う)。作品ファイル・ap-kit.js・worker.js は読むだけ。
"""
import argparse
import base64
import hashlib
import html as htmllib
import json
import os
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen_posters as gp  # noqa: E402  (ポスターと同じ作品一覧・撮影設定・サーバーを使う)

ROOT = gp.ROOT
OG_DIR = ROOT / "og"
OG_MANIFEST = OG_DIR / "manifest.json"
BRAND_IMG = ROOT / "brand" / "og-image.jpg"

OG_W, OG_H = 1200, 630
ART_W = 472                 # 作品カードの左パネル幅(高さは630)
BRAND_PANEL_W = 400         # 既定画像の3分割パネル幅
QUALITY = 82
OG_VERSION = 1              # デザインや撮影方法を変えたら上げる(全部「古い」扱いになる)
BRAND_WORKS = ["art-v89-lamp-fold.html", "art-v85-animal-mansion.html", "art-v88-birthmark.html"]
TAGLINE = "触ると、世界のルールが変わる。"
TAGLINE_SUB = "インタラクティブなジェネラティブアートのプレイグラウンド"


def og_name(src):
    return re.sub(r"\.html$", "", src).replace("/", "__") + ".jpg"


def index_info():
    """index.html から {パス: 表示名} と {パス: META上書きの一言} を読む"""
    h = (ROOT / "index.html").read_text(encoding="utf-8")
    names = {}
    for p, n in re.findall(r"openArt\('([^']+)','([^']*)'\)", h):
        names.setdefault(p, n)
    subs = dict(re.findall(r"'([^']+\.html)'\s*:\s*\{[^}]*?\bsub\s*:\s*'([^']*)'", h))
    return names, subs


def work_sub(src, subs):
    if src in subs:
        return subs[src]
    t = re.search(r"<title[^>]*>(.*?)</title>", (ROOT / src).read_text(encoding="utf-8"), re.S | re.I)
    parts = re.split(r"\s*[\u2014\u2013]\s*", re.sub(r"\s+", " ", t.group(1)).strip()) if t else []
    for p in reversed(parts[1:]):
        if re.search(r"[\u3040-\u30ff\u4e00-\u9fff]", p):
            return p.strip()
    return ""


def card_hash(src, cfg, name, sub):
    h = hashlib.sha1()
    h.update(str(OG_VERSION).encode())
    h.update((ROOT / src).read_bytes())
    h.update(json.dumps(cfg.get(src, {}), sort_keys=True).encode())
    h.update((name + "|" + sub).encode())
    return h.hexdigest()[:10]


def load_manifest():
    if OG_MANIFEST.exists():
        return json.loads(OG_MANIFEST.read_text(encoding="utf-8"))
    return {"v": 1, "items": {}}


def save_manifest(man, order):
    items = man.get("items", {})
    ordered = {k: items[k] for k in order if k in items}
    for k, v in items.items():  # index.html から消えた作品の分も残す(削除しない方針)
        ordered.setdefault(k, v)
    man["v"], man["items"] = 1, ordered
    OG_DIR.mkdir(exist_ok=True)
    OG_MANIFEST.write_text(json.dumps(man, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def capture(browser, port, src, cfg, width):
    """作品を width x 630 で撮ってPNGバイト列を返す(posterと同じ taps/holds/delay/hide を適用)"""
    c = cfg.get(src, {})
    ctx = browser.new_context(viewport={"width": width, "height": OG_H}, device_scale_factor=1)
    page = ctx.new_page()
    lib_dir = os.environ.get("POSTER_LIB_DIR")
    if lib_dir:
        def _lib(route):
            f = Path(lib_dir) / route.request.url.split("?")[0].rsplit("/", 1)[-1]
            if f.exists():
                route.fulfill(status=200, content_type="application/javascript", body=f.read_bytes())
            else:
                route.continue_()
        page.route(re.compile(r"^https?://(?!127\.0\.0\.1).*\.js(\?.*)?$"), _lib)
    page.set_default_timeout(int(c.get("timeout", gp.PAGE_TIMEOUT_MS)))
    try:
        page.goto(f"http://127.0.0.1:{port}/{src}", wait_until="load")
        # 操作説明(#hint)とap-kitのUI(ボタン・時計)は写さない
        base_hide = ["#hint", ".apk-ctrl", ".apk-clock", ".apk-toast"]
        hide = base_hide + [s for s in c.get("hide", []) if s not in base_hide]
        page.add_style_tag(content="".join(f"{s}{{display:none!important}}" for s in hide))
        for x, y in c.get("taps", []):
            page.mouse.click(min(x, width - 1), min(y, OG_H - 1))
            page.wait_for_timeout(250)
        for x, y, ms in c.get("holds", []):
            page.mouse.move(min(x, width - 1), min(y, OG_H - 1))
            page.mouse.down()
            page.wait_for_timeout(int(ms))
            page.mouse.up()
        page.wait_for_timeout(int(c.get("delay", gp.DEFAULT_DELAY_MS)))
        return page.screenshot(clip={"x": 0, "y": 0, "width": width, "height": OG_H})
    finally:
        ctx.close()


BASE_CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;background:#050507;overflow:hidden}
body{position:relative;color:#f2f2f7;font-family:"Noto Sans CJK JP","Noto Sans JP","Hiragino Sans","IPAPGothic",sans-serif;-webkit-font-smoothing:antialiased}
.mono{font-family:"DejaVu Sans Mono","SF Mono",Menlo,monospace}
.brand{display:flex;align-items:center;gap:16px;font-size:22px;letter-spacing:.3em;color:#9a9aa6}
.brand i{width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#7ad9ff,#ff7ad9);box-shadow:0 0 18px rgba(122,217,255,.7)}
.bar{position:absolute;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,#7ad9ff,#ff7ad9);z-index:5}
"""


def card_html(png, name, sub):
    b64 = base64.b64encode(png).decode()
    return f"""<!doctype html><meta charset="utf-8"><style>{BASE_CSS}
.art{{position:absolute;left:0;top:0;width:{ART_W}px;height:630px;background:#000 url(data:image/png;base64,{b64}) 0 0/{ART_W}px 630px no-repeat}}
.art::after{{content:"";position:absolute;right:0;top:0;bottom:0;width:1px;background:rgba(255,255,255,.12)}}
.side{{position:absolute;left:{ART_W}px;right:0;top:0;bottom:0;padding:58px 64px 54px 68px;display:flex;flex-direction:column}}
.name{{margin-top:auto;font-weight:800;font-size:84px;line-height:1.02;letter-spacing:-.02em;text-wrap:balance;overflow-wrap:anywhere}}
.sub{{margin-top:24px;font-size:34px;line-height:1.5;color:#e2e2e8;text-wrap:balance}}
.tag{{margin-top:44px;font-size:24px;color:#84848f;letter-spacing:.04em}}
</style><div class="bar"></div><div class="art"></div>
<div class="side"><div class="brand mono"><i></i>ART PLAYGROUND</div>
<div class="name">{htmllib.escape(name)}</div>{f'<div class="sub">{htmllib.escape(sub)}</div>' if sub else ''}
<div class="tag">{TAGLINE}</div></div>"""


def brand_html(pngs):
    panels = "".join(
        f'<div style="position:absolute;left:{i*BRAND_PANEL_W}px;top:0;width:{BRAND_PANEL_W}px;height:630px;'
        f'background:#000 url(data:image/png;base64,{base64.b64encode(p).decode()}) 0 0/{BRAND_PANEL_W}px 630px no-repeat"></div>'
        for i, p in enumerate(pngs)
    )
    return f"""<!doctype html><meta charset="utf-8"><style>{BASE_CSS}
.shade{{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,5,7,.96) 0,rgba(5,5,7,.86) 34%,rgba(5,5,7,.35) 62%,rgba(5,5,7,0) 82%)}}
.copy{{position:absolute;left:68px;right:68px;bottom:56px}}
.h{{margin-top:26px;font-weight:800;font-size:72px;line-height:1.1;letter-spacing:-.02em}}
.s{{margin-top:18px;font-size:28px;color:#d6d6de}}
</style>{panels}<div class="shade"></div><div class="bar"></div>
<div class="copy"><div class="brand mono"><i></i>ART PLAYGROUND</div><div class="h">{TAGLINE}</div><div class="s">{TAGLINE_SUB}</div></div>"""


def render_jpg(browser, html_text):
    ctx = browser.new_context(viewport={"width": OG_W, "height": OG_H}, device_scale_factor=1)
    page = ctx.new_page()
    page.set_content(html_text, wait_until="load")
    page.wait_for_timeout(400)
    data = page.screenshot(type="jpeg", quality=QUALITY, clip={"x": 0, "y": 0, "width": OG_W, "height": OG_H})
    ctx.close()
    return data


def main():
    ap = argparse.ArgumentParser(description="共有カード画像(OGP)を作る")
    ap.add_argument("--check", action="store_true", help="作らず点検だけ(足りない/古いで終了コード1)")
    ap.add_argument("--all", action="store_true", help="全作品を作り直す")
    ap.add_argument("--only", default="", help="カンマ区切り。パスの一部が一致する作品だけ作り直す")
    ap.add_argument("--brand", action="store_true", help="サイト全体の既定画像 brand/og-image.jpg を作り直す")
    args = ap.parse_args()

    works = gp.gallery_works()
    cfg = gp.load_config()
    names, subs = index_info()
    man = load_manifest()
    items = man.get("items", {})

    missing, stale = [], []
    info = {}
    for src in works:
        if not (ROOT / src).exists():
            continue
        name = names.get(src) or Path(src).stem.upper()
        sub = work_sub(src, subs)
        info[src] = (name, sub)
        it = items.get(src)
        if not it or not (OG_DIR / it["f"]).exists():
            missing.append(src)
        elif it.get("h") != card_hash(src, cfg, name, sub):
            stale.append(src)
    brand_missing = not BRAND_IMG.exists()
    print(f"ギャラリー作品 {len(works)} 件 / OK {len(works)-len(missing)-len(stale)} / 無し {len(missing)} / 古い {len(stale)}"
          + ("  / 既定画像(brand/og-image.jpg)が無い" if brand_missing else ""))
    for s in missing:
        print(f"  MISSING {s}")
    for s in stale:
        print(f"  STALE   {s}  (作品ファイル・撮影設定・作品名/一言が変わった)")
    if args.check:
        return 1 if (missing or stale or brand_missing) else 0

    only = [t.strip() for t in args.only.split(",") if t.strip()]
    if args.all:
        todo = list(info)
    elif only:
        todo = [s for s in info if any(t in s for t in only)]
    else:
        todo = missing + stale
    do_brand = args.brand or brand_missing
    if not todo and not do_brand:
        print("作るものはありません。")
        return 0

    from playwright.sync_api import sync_playwright

    srv, port = gp.start_server()
    OG_DIR.mkdir(exist_ok=True)
    failed, total, t0 = [], 0, time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox", "--enable-unsafe-swiftshader"])
        for i, src in enumerate(todo, 1):
            t = time.time()
            name, sub = info[src]
            try:
                png = capture(browser, port, src, cfg, ART_W)
                data = render_jpg(browser, card_html(png, name, sub))
            except Exception as e:  # 1作品の失敗で全体を止めない
                failed.append((src, str(e).splitlines()[0][:80]))
                print(f"[{i}/{len(todo)}] FAIL  {src}  {failed[-1][1]}")
                continue
            f = og_name(src)
            (OG_DIR / f).write_bytes(data)
            man.setdefault("items", {})[src] = {"f": f, "h": card_hash(src, cfg, name, sub)}
            total += len(data)
            print(f"[{i}/{len(todo)}] ok    {src}  {len(data)/1024:.0f}KB  {time.time()-t:.0f}s")
            save_manifest(man, works)
        if do_brand:
            try:
                pngs = [capture(browser, port, s, cfg, BRAND_PANEL_W) for s in BRAND_WORKS]
                data = render_jpg(browser, brand_html(pngs))
                BRAND_IMG.parent.mkdir(exist_ok=True)
                BRAND_IMG.write_bytes(data)
                total += len(data)
                print(f"brand/og-image.jpg  {len(data)/1024:.0f}KB")
            except Exception as e:
                failed.append(("brand/og-image.jpg", str(e).splitlines()[0][:80]))
                print(f"FAIL  brand/og-image.jpg  {failed[-1][1]}")
        browser.close()
    srv.shutdown()
    save_manifest(man, works)
    print(f"完了: {len(todo)-len([f for f in failed if f[0] != 'brand/og-image.jpg'])} 枚 / 計 {total/1024:.0f}KB / {time.time()-t0:.0f}s")
    if failed:
        print("失敗:")
        for s, why in failed:
            print(f"  {s}  {why}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
