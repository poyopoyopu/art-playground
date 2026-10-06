#!/usr/bin/env python3
"""
ART PLAYGROUND ポスター生成 — ギャラリーのタイルに敷く静止画(下地)を作る。

【なぜ要るか】
index.html は同時に動かすiframeを LIVE_BUDGET(=2)枠だけにしている。残りのタイルは
iframeを外すので、ポスターが無いと「黒いタイル」になる。ポスターはその下地。

【ルール(index.html側と1対1)】
- 対象 = index.html の data-src に載っている全作品(CURRENT + LOG)。これが唯一の一覧。
- 画像 = posters/<パスから .html を除き / を __ に置換>.webp   例: prototypes/chroma-grid.html
        → posters/prototypes__chroma-grid.webp
- posters/manifest.json に「どの作品の・どのファイルの・作品ファイルのハッシュ」を記録する。
  index.html は manifest に載っている作品にだけポスターを貼る(無い作品は従来どおりの暗いタイル)。
- 撮影 = 460x900(ギャラリーのiframeと同じ)で読み込み、上端 460x613(3:4タイルに見える範囲)を
  切り出して 344x459 / WebP q70 に縮小する。
- ヒーロー(index.html の先頭の data-src = CURRENT)だけは、表示が大きい(約354px幅)ので
  690x920 の専用版(<名前>.hero.webp、manifestの "hf")も作る。CURRENTを替えると --check が不足を知らせる。

【使い方】
  python3 tools/gen_posters.py                 # 足りない・古いポスターだけ作る(新作追加後はこれだけ)
  python3 tools/gen_posters.py --check         # 作らずに点検。足りない/古いがあれば終了コード1(CI用)
  python3 tools/gen_posters.py --only holo-compass,lamp-fold   # パスの一部が一致する作品だけ作り直す
  python3 tools/gen_posters.py --all           # 全部作り直す

【作品ごとの調整】tools/poster-config.json(任意)
  { "art-v47-infection.html": { "taps": [[230, 300]], "holds": [[120, 500, 600]], "delay": 3000, "timeout": 90000 } }
  delay   = 読み込み後に待つms(既定 2500)
  taps    = 撮影前にクリックする座標(触るまで何も出ない作品用)
  holds   = 撮影前に [x, y, 押し続けるms] で長押しする(押して引く作品用)
  timeout = この作品だけ撮影の上限ms(既定 45000。重い作品用)
  hide    = 撮影のあいだ隠すCSSセレクタの配列(例 ["#hint"])。作品の冒頭に出る操作説明(#hint)が
            ポスターに写り込むのを防ぐ。説明が自動で消えない作品もあるので、delayで待つより確実
  ※ hide(読み込み直後) → taps → holds → delay の順に実行。ポスターは「少し触った後」の姿になる。

外部CDN(p5.js等)に出られない環境で撮るとき: 環境変数 POSTER_LIB_DIR にライブラリのファイル置き場を指定すると、
  同じファイル名(例 p5.min.js)のCDN読み込みをそのフォルダのものに差し替える。通常(CI等、CDNに出られる環境)は不要。
  ※ 現在ギャラリーで外部ライブラリを使うのは VOID FIELD II / INFECTION の p5@1.11.10 のみ。

必要: python3, playwright(pip install playwright pillow && playwright install chromium), pillow
作品ファイル・ap-kit.js・worker.js は読むだけで一切変更しない。
"""
import argparse
import functools
import hashlib
import http.server
import io
import json
import os
import re
import socketserver
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTER_DIR = ROOT / "posters"
MANIFEST = POSTER_DIR / "manifest.json"
CONFIG = ROOT / "tools" / "poster-config.json"

VIEW_W, VIEW_H = 460, 900   # index.html の .entry iframe と同じ
CROP_H = 613                # 460 * 4/3 = 3:4 タイルに見える範囲
OUT_W, OUT_H = 344, 459     # 実タイル(約172x229)の約2倍密度
HERO_W, HERO_H = 690, 920   # ヒーロー(CURRENT)専用。表示幅約354pxの約2倍。1枚だけなので大きくてよい
QUALITY = 70
DEFAULT_DELAY_MS = 2500
PAGE_TIMEOUT_MS = 45000     # 重い作品(ソフトウェアGPU)で固まらないための上限
RENDER_VERSION = 2          # サイズ・画質・撮影方法を変えたら上げる(全ポスターが「古い」扱いになる)


def poster_name(src, hero=False):
    """index.html の JS と同じ規則(ヒーロー用は .hero.webp)。変えるなら両方変えること。"""
    return re.sub(r"\.html$", "", src).replace("/", "__") + (".hero" if hero else "") + ".webp"


def gallery_works():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    seen, out = set(), []
    for src in re.findall(r'data-src="([^"]+)"', html):
        if src not in seen:
            seen.add(src)
            out.append(src)
    return out


def load_config():
    if CONFIG.exists():
        return json.loads(CONFIG.read_text(encoding="utf-8"))
    return {}


def work_hash(src, cfg):
    h = hashlib.sha1()
    h.update(str(RENDER_VERSION).encode())
    h.update((ROOT / src).read_bytes())
    h.update(json.dumps(cfg.get(src, {}), sort_keys=True).encode())
    return h.hexdigest()[:10]


def load_manifest():
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text(encoding="utf-8"))
    return {"v": 1, "w": OUT_W, "h": OUT_H, "items": {}}


def save_manifest(man, order):
    man["v"], man["w"], man["h"] = 1, OUT_W, OUT_H
    items = man.get("items", {})
    ordered = {k: items[k] for k in order if k in items}
    for k, v in items.items():  # index.html から消えた作品の分も残す(削除しない方針)
        ordered.setdefault(k, v)
    man["items"] = ordered
    POSTER_DIR.mkdir(exist_ok=True)
    MANIFEST.write_text(json.dumps(man, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def classify(works, man, cfg):
    """(missing, stale, ok, orphan) を返す"""
    items = man.get("items", {})
    missing, stale, ok = [], [], []
    for src in works:
        it = items.get(src)
        if not (ROOT / src).exists():
            missing.append((src, "作品ファイルが無い"))
        elif not it or not (POSTER_DIR / it["f"]).exists():
            missing.append((src, "ポスター無し"))
        elif it.get("h") != work_hash(src, cfg):
            stale.append(src)
        elif src == works[0] and not (it.get("hf") and (POSTER_DIR / it["hf"]).exists()):
            missing.append((src, "ヒーロー用(CURRENT)のポスター無し"))
        else:
            ok.append(src)
    orphan = [k for k in items if k not in set(works)]
    return missing, stale, ok, orphan


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def start_server():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, srv.server_address[1]


def shoot(browser, port, src, cfg, hero=False):
    """作品を撮影して (webpバイト列, 平均輝度, 輝度の標準偏差) を返す。失敗は例外。hero=True は大きいサイズ。"""
    from PIL import Image, ImageStat

    c = cfg.get(src, {})
    ctx = browser.new_context(viewport={"width": VIEW_W, "height": VIEW_H}, device_scale_factor=(HERO_W / VIEW_W) if hero else 1)
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
    page.set_default_timeout(int(c.get("timeout", PAGE_TIMEOUT_MS)))
    try:
        page.goto(f"http://127.0.0.1:{port}/{src}", wait_until="load")
        hide = c.get("hide", [])
        if hide:  # 操作説明などを隠して撮る(display:none なので後から出てきても写らない)
            page.add_style_tag(content="".join(f"{sel}{{display:none!important}}" for sel in hide))
        for x, y in c.get("taps", []):
            page.mouse.click(x, y)
            page.wait_for_timeout(250)
        for x, y, ms in c.get("holds", []):
            page.mouse.move(x, y)
            page.mouse.down()
            page.wait_for_timeout(int(ms))
            page.mouse.up()
        page.wait_for_timeout(int(c.get("delay", DEFAULT_DELAY_MS)))
        png = page.screenshot(clip={"x": 0, "y": 0, "width": VIEW_W, "height": CROP_H})
    finally:
        ctx.close()
    im = Image.open(io.BytesIO(png)).convert("RGB")
    st = ImageStat.Stat(im.convert("L"))
    im = im.resize((HERO_W, HERO_H) if hero else (OUT_W, OUT_H), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=QUALITY, method=6)
    return buf.getvalue(), st.mean[0], st.stddev[0]


def main():
    ap = argparse.ArgumentParser(description="ART PLAYGROUND ポスター生成")
    ap.add_argument("--check", action="store_true", help="作らず点検だけ(足りない/古いで終了コード1)")
    ap.add_argument("--all", action="store_true", help="全作品を作り直す")
    ap.add_argument("--only", default="", help="カンマ区切り。パスの一部が一致する作品だけ作り直す")
    args = ap.parse_args()

    works = gallery_works()
    cfg = load_config()
    man = load_manifest()
    missing, stale, ok, orphan = classify(works, man, cfg)

    print(f"ギャラリー作品 {len(works)} 件 / OK {len(ok)} / 無し {len(missing)} / 古い {len(stale)} / 余り {len(orphan)}")
    for s, why in missing:
        print(f"  MISSING {s}  ({why})")
    for s in stale:
        print(f"  STALE   {s}  (作品ファイルか撮影設定が変わった)")
    for s in orphan:
        print(f"  ORPHAN  {s}  (index.html に無い。ポスターは残してある)")

    if args.check:
        return 1 if (missing or stale) else 0

    only = [t.strip() for t in args.only.split(",") if t.strip()]
    if args.all:
        todo = list(works)
    elif only:
        todo = [s for s in works if any(t in s for t in only)]
    else:
        todo = [s for s, _ in missing if (ROOT / s).exists()] + stale
    if not todo:
        print("作るものはありません。")
        return 0

    from playwright.sync_api import sync_playwright

    srv, port = start_server()
    POSTER_DIR.mkdir(exist_ok=True)
    failed, total = [], 0
    t0 = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox", "--enable-unsafe-swiftshader"])
        for i, src in enumerate(todo, 1):
            t = time.time()
            try:
                data, mean, sd = shoot(browser, port, src, cfg)
            except Exception as e:  # 1作品の失敗で全体を止めない
                failed.append((src, str(e).splitlines()[0][:80]))
                print(f"[{i}/{len(todo)}] FAIL  {src}  {failed[-1][1]}")
                continue
            name = poster_name(src)
            (POSTER_DIR / name).write_bytes(data)
            man["items"][src] = {"f": name, "h": work_hash(src, cfg)}
            total += len(data)
            if src == works[0]:  # index.html の先頭 = CURRENT(ヒーロー)。大きいサイズも作る
                try:
                    hdata, _, _ = shoot(browser, port, src, cfg, hero=True)
                    hname = poster_name(src, hero=True)
                    (POSTER_DIR / hname).write_bytes(hdata)
                    man["items"][src]["hf"] = hname
                    total += len(hdata)
                    print(f"        + hero  {hname}  {len(hdata)/1024:.1f}KB")
                except Exception as e:
                    print(f"        + hero FAIL {str(e).splitlines()[0][:80]}")
            flag = ""
            if mean < 6 and sd < 4:
                flag = "  ⚠ ほぼ真っ黒。poster-config.json で delay か taps を足す"
            elif sd < 2.5:
                flag = "  ⚠ ほぼ一色。poster-config.json で delay か taps を足す"
            print(f"[{i}/{len(todo)}] ok    {src}  {len(data)/1024:.1f}KB  明るさ{mean:.0f}  {time.time()-t:.0f}s{flag}")
            save_manifest(man, works)  # 1枚ごとに保存(途中で落ちても進捗が残る)
        browser.close()
    srv.shutdown()
    save_manifest(man, works)
    print(f"完了: {len(todo)-len(failed)} 枚 / 計 {total/1024:.0f}KB / {time.time()-t0:.0f}s")
    if failed:
        print("失敗:")
        for s, why in failed:
            print(f"  {s}  {why}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
