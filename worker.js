import { onRequestPost } from './functions/api/vote.js';
import { onRequestGet } from './functions/api/results.js';

const SOCIAL_CSS = `
  /* ---------- social (minimal, no frame — kept visually lighter than SUPPORT) ---------- */
  .social{
    margin:30px 2px 0;
    padding:0 8px;
    text-align:center;
  }
  .social-kicker{
    margin:0 0 8px;
    font-size:9px;
    letter-spacing:.28em;
    color:var(--text-3);
  }
  .social h2{
    margin:0;
    font-size:14px;
    line-height:1.5;
    font-weight:700;
    letter-spacing:-.02em;
    color:var(--text-2);
  }
  .social-links{
    display:flex;
    justify-content:center;
    align-items:center;
    gap:26px;
    margin-top:14px;
  }
  .social-link{
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:6px 2px;
    color:var(--text-3);
    font-size:10.5px;
    font-weight:700;
    letter-spacing:.06em;
    transition:color .18s ease, transform .18s ease;
  }
  .social-link svg{
    width:15px;
    height:15px;
    flex:none;
    transition:transform .18s ease;
  }
  .social-link:active{ transform:scale(.92); }
  .social-link:active svg{ transform:scale(.88); }
  @media (hover:hover){
    .social-link:hover{ transform:translateY(-1px); }
    .social-link.ig:hover{ color:var(--b); }
    .social-link.ig:hover svg{ transform:rotate(-8deg) scale(1.08); }
    .social-link.tt:hover{ color:var(--a); }
    .social-link.tt:hover svg{ transform:scale(1.1); }
  }
`;

const SOCIAL_HTML = `
  <section class="social" aria-label="ART PLAYGROUND social links">
    <div class="social-kicker mono">FOLLOW THE PLAYGROUND</div>
    <h2>新しい作品、実験、変化の記録をSNSで。</h2>
    <div class="social-links">
      <a class="social-link ig" href="https://www.instagram.com/artplayground.art/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5.5"/>
          <circle cx="12" cy="12" r="4.1"/>
          <circle cx="17.1" cy="6.9" r="0.55" fill="currentColor" stroke="none"/>
        </svg>
        Instagram
      </a>
      <a class="social-link tt" href="https://www.tiktok.com/@artplayground.art" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.6 3h-3v12.2a2.9 2.9 0 1 1-2.05-2.77v-3.05a5.95 5.95 0 1 0 5.05 5.88V9.2a7.1 7.1 0 0 0 4.1 1.3V7.5a4.1 4.1 0 0 1-4.1-4.1V3z"/>
        </svg>
        TikTok
      </a>
    </div>
  </section>
`;

// ================= SNS導線まわり(2026/10) =================
// 1) 公開作品ページ(art-vNN-xxx.html など)を「直接」開いたとき(SNSのクローラー含む)に、共有カード(OGP)とfaviconを<head>へ差し込む。
//    og:image は og/<パス>.jpg(tools/gen_og.py が作る。無ければ brand/og-image.jpg)。作品ファイル自体は書き換えない。
// 2) 人が直接開いたとき(Sec-Fetch-Dest: document)だけ、左上に「‹ ART PLAYGROUND」(ギャラリーへ戻る)のピルを足す。
//    ギャラリーのプレビュー/全画面(iframe)では出さない。
// 3) ギャラリー/作品を人が直接開いた回数を、流入元(?s=ig など + リファラのホスト名)つきで landings に記録する。
const WORK_PAGE_RE = /^\/(art-v\d+(-[^/]+)?|void-field-ii)\.html$/i;
const WORK_PAGE_EXTRA = new Set(['/prototypes/chroma-grid.html', '/prototypes/spiral-spectrum-200-v9.html', '/prototypes/membrane-rgb.html']);
function isWorkPage(pathname) { return WORK_PAGE_RE.test(pathname) || WORK_PAGE_EXTRA.has(pathname); }
function ogImageFor(pathname) { return '/og/' + pathname.replace(/^\/+/, '').replace(/\.html$/i, '').replace(/\//g, '__') + '.jpg'; } // tools/gen_og.py の og_name() と同じ規則
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function parseWorkTitle(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const t = m ? m[1].replace(/\s+/g, ' ').trim() : '';
  const parts = t.split(/\s*[\u2014\u2013]\s*/);
  const ja = parts.slice(1).reverse().find((p) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(p)) || '';
  let name = parts[0] || 'ART PLAYGROUND';
  if (!ja && parts.length > 1) name = parts[parts.length - 1];
  return { name: name.trim(), ja: ja.trim() };
}
async function pickOgImage(env, origin, pathname) {
  const rel = ogImageFor(pathname);
  try {
    const r = await env.ASSETS.fetch(new Request(origin + rel, { method: 'HEAD' }));
    if (r.ok) return origin + rel;
  } catch (e) { /* 既定画像へ */ }
  return origin + '/brand/og-image.jpg';
}
function workHeadTags({ name, ja, image }) {
  const title = name + ' — ART PLAYGROUND';
  const desc = (ja ? ja + ' — ' : '') + 'ART PLAYGROUNDのインタラクティブ作品。触ると、世界のルールが変わる。';
  return [
    '<meta name="description" content="' + esc(desc) + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="ART PLAYGROUND">',
    '<meta property="og:locale" content="ja_JP">',
    '<meta property="og:title" content="' + esc(title) + '">',
    '<meta property="og:description" content="' + esc(desc) + '">',
    '<meta property="og:image" content="' + esc(image) + '">',
    '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + esc(title) + '">',
    '<meta name="twitter:description" content="' + esc(desc) + '">',
    '<meta name="twitter:image" content="' + esc(image) + '">',
    '<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">',
    '<link rel="icon" href="/brand/favicon-32.png" sizes="32x32" type="image/png">',
    '<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">'
  ].join('\n');
}
const HOME_PILL = `
<style>
#ap-home{position:fixed;z-index:2147483000;top:calc(env(safe-area-inset-top,0px) + 12px);left:12px;display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 14px 0 11px;border-radius:999px;background:rgba(10,10,16,.55);border:1px solid rgba(255,255,255,.18);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:#f2f2f7;font:600 11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.2em;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.4);opacity:1;transition:opacity .5s ease;-webkit-tap-highlight-color:transparent}
#ap-home::before{content:"";position:absolute;inset:-6px}
#ap-home i{display:block;width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#7ad9ff,#ff7ad9);box-shadow:0 0 8px rgba(122,217,255,.7)}
#ap-home.idle{opacity:0;pointer-events:none}
#ap-home:focus-visible{outline:2px solid #7ad9ff;outline-offset:3px}
@media (prefers-reduced-motion:reduce){#ap-home{transition:none}}
</style>
<a id="ap-home" href="/" aria-label="ART PLAYGROUND のギャラリーへ"><i></i>‹ ART PLAYGROUND</a>
<script>
(function(){var a=document.getElementById('ap-home');if(!a)return;var t;
function show(){a.classList.remove('idle');clearTimeout(t);t=setTimeout(function(){a.classList.add('idle')},4000)}
show();
['touchstart','pointerdown','mousemove','keydown'].forEach(function(ev){addEventListener(ev,show,{passive:true,capture:true})});
['touchstart','touchend','pointerdown','pointerup','mousedown','mouseup'].forEach(function(ev){a.addEventListener(ev,function(e){e.stopPropagation()})});/* 作品側のタッチ処理にpreventDefaultされてリンクが効かなくなるのを防ぐ */
a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();location.href=a.getAttribute('href')});
})();
</script>
`;
function htmlResponse(asset, body) {
  const headers = new Headers(asset.headers);
  // The body was changed, so stale byte/encoding validators must not be reused.
  headers.delete('content-length'); headers.delete('content-encoding'); headers.delete('etag'); headers.delete('content-md5');
  return new Response(body, { status: asset.status, statusText: asset.statusText, headers });
}
function cleanSource(v) { v = String(v || '').toLowerCase(); return /^[a-z0-9_-]{1,16}$/.test(v) ? v : ''; }
function refererHost(request, url) {
  try {
    const h = new URL(request.headers.get('referer') || '').hostname.toLowerCase();
    return h && h !== url.hostname.toLowerCase() ? h.slice(0, 64) : '';
  } catch (e) { return ''; }
}
async function ensureLandingSchema(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS landings (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT NOT NULL, src TEXT NOT NULL, ref TEXT NOT NULL, created_at TEXT NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_landings_created_at ON landings(created_at)').run();
}
async function recordLanding(db, path, src, ref) {
  try {
    await ensureLandingSchema(db);
    await db.prepare('INSERT INTO landings (path,src,ref,created_at) VALUES (?,?,?,?)').bind(path, src, ref, new Date().toISOString()).run();
  } catch (e) { console.error('LANDING_RECORD_FAILED', e); }
}
async function onRequestGetSources({ env }) {
  const db = env.DB || env.BD;
  if (!db) return json({ error: 'DB_NOT_CONFIGURED' }, 503);
  try {
    await ensureLandingSchema(db);
    const since = "created_at >= datetime('now','-30 days')";
    const total = await db.prepare('SELECT COUNT(*) AS n FROM landings').first();
    const recent = await db.prepare('SELECT COUNT(*) AS n FROM landings WHERE ' + since).first();
    const bySrc = await db.prepare("SELECT src, COUNT(*) AS visits FROM landings WHERE " + since + " GROUP BY src ORDER BY visits DESC").all();
    const byRef = await db.prepare("SELECT ref, COUNT(*) AS visits FROM landings WHERE " + since + " GROUP BY ref ORDER BY visits DESC LIMIT 15").all();
    const byPath = await db.prepare("SELECT path, COUNT(*) AS visits FROM landings WHERE " + since + " GROUP BY path ORDER BY visits DESC LIMIT 15").all();
    return json({ total: Number(total?.n || 0), last_30_days: Number(recent?.n || 0), by_source: bySrc.results || [], by_referrer: byRef.results || [], by_path: byPath.results || [] });
  } catch (e) {
    console.error('SOURCES_QUERY_FAILED', e);
    return json({ error: 'SOURCES_QUERY_FAILED', detail: String((e && e.message) || e) }, 500);
  }
}
// ================= /SNS導線まわり =================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/vote') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
      return onRequestPost({ request, env, ctx });
    }
    if (url.pathname === '/api/results') {
      if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
      return onRequestGet({ request, env, ctx });
    }
    if (url.pathname === '/api/views') {
      if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
      return onRequestGetAnalytics({ env });
    }
    if (url.pathname === '/api/sources') {
      if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
      return onRequestGetSources({ env });
    }

    const asset = await env.ASSETS.fetch(request);

    // Count explicit full-screen opens from the gallery, plus direct top-level opens of published art pages.
    // Gallery preview iframes are excluded: they carry neither ap_view=1 nor Sec-Fetch-Dest=document.
    const isGalleryOpen = url.searchParams.get('ap_view') === '1';
    const isPublishedWork = /^\/art-v\d+-[^/]+\.html$/i.test(url.pathname);
    const isDirectDocument = request.headers.get('sec-fetch-dest') === 'document';
    if (env.DB && (isGalleryOpen || (isPublishedWork && isDirectDocument))) {
      // ギャラリー(index.html)のdata-srcと同じ形「art-vNN-xxx.html」(先頭の/なし・.htmlつき)で記録する
      let workPath = url.pathname.replace(/^\/+/, '');
      if (workPath && !/\.html$/i.test(workPath)) workPath += '.html';
      const workTitle = (url.searchParams.get('ap_title') || workPath).slice(0, 120);
      ctx.waitUntil(recordView(env.DB, workPath, workTitle));
    }

    // 流入の記録: 人が直接開いた(Sec-Fetch-Destがdocument。クローラーやギャラリーのiframeは付かない/別の値)ギャラリー・作品ページだけ。
    // 流入元は ?s=ig / ?s=tt(または utm_source)とリファラのホスト名だけ。IPやUAは記録しない。
    const dest = request.headers.get('sec-fetch-dest');
    const isGalleryTop = url.pathname === '/' || url.pathname === '/index.html';
    if (env.DB && request.method === 'GET' && asset.ok && dest === 'document' && (isGalleryTop || isWorkPage(url.pathname))) {
      const landPath = isGalleryTop ? '/' : url.pathname;
      ctx.waitUntil(recordLanding(env.DB, landPath, cleanSource(url.searchParams.get('s') || url.searchParams.get('utm_source')), refererHost(request, url)));
    }

    // 公開作品ページ: 共有カード(OGP)をクローラー/直接開きに、戻りリンクを直接開きに差し込む。
    if (isWorkPage(url.pathname) && request.method === 'GET' && asset.ok && (!dest || dest === 'document')) {
      const ct = asset.headers.get('content-type') || '';
      if (ct.includes('text/html')) {
        let html = await asset.text();
        const { name, ja } = parseWorkTitle(html);
        const image = await pickOgImage(env, url.origin, url.pathname);
        if (!/property="og:title"/i.test(html)) html = html.replace(/<\/head>/i, () => workHeadTags({ name, ja, image }) + '\n</head>');
        if (dest === 'document') {
          const i = html.toLowerCase().lastIndexOf('</body>');
          html = i >= 0 ? html.slice(0, i) + HOME_PILL + html.slice(i) : html + HOME_PILL;
        }
        return htmlResponse(asset, html);
      }
    }

    // Add social links only to the gallery page.
    if ((url.pathname === '/' || url.pathname === '/index.html') && asset.ok) {
      const contentType = asset.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const html = await asset.text();
        // FOLLOWセクションは index.html 側に持つ(2026/10〜)。持っていない古い版のときだけ、従来どおりここで差し込む。
        const hasFollow = html.includes('class="follow"');
        const enhanced = (hasFollow ? html : html
          .replace('</style>', SOCIAL_CSS + '</style>')
          .replace(/<section class="support"[^>]*>/, SOCIAL_HTML + '$&'))
          .replace(/f\.src=url;/, "f.src=url+(url.indexOf('?')>=0?'&':'?')+'ap_view=1&ap_title='+encodeURIComponent(title||'');");

        const headers = new Headers(asset.headers);
        // The body was changed, so stale byte/encoding validators must not be reused.
        headers.delete('content-length');
        headers.delete('content-encoding');
        headers.delete('etag');
        headers.delete('content-md5');

        return new Response(enhanced, {
          status: asset.status,
          statusText: asset.statusText,
          headers
        });
      }
    }

    return asset;
  }
};

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
async function ensureAnalyticsSchema(db){
  await db.prepare('CREATE TABLE IF NOT EXISTS art_views (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT NOT NULL, title TEXT NOT NULL, created_at TEXT NOT NULL)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_art_views_path ON art_views(path)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_art_views_created_at ON art_views(created_at)').run();
}
async function recordView(db,path,title){
  try{
    await ensureAnalyticsSchema(db);
    await db.prepare('INSERT INTO art_views (path,title,created_at) VALUES (?,?,?)').bind(path,title,new Date().toISOString()).run();
  }catch(e){console.error('ART_VIEW_RECORD_FAILED',e)}
}
async function onRequestGetAnalytics({env}){
  const db=env.DB||env.BD;
  if(!db)return json({error:'DB_NOT_CONFIGURED'},503);
  try{
    await ensureAnalyticsSchema(db);
    const total=await db.prepare('SELECT COUNT(*) AS views FROM art_views').first();
    const recent=await db.prepare("SELECT COUNT(*) AS views FROM art_views WHERE created_at >= datetime('now','-30 days')").first();
    const works=await db.prepare('SELECT path,MAX(title) AS title,COUNT(*) AS views,MAX(created_at) AS last_view FROM art_views GROUP BY path ORDER BY views DESC').all();
    const daily=await db.prepare("SELECT substr(created_at,1,10) AS day,COUNT(*) AS views FROM art_views WHERE created_at >= datetime('now','-30 days') GROUP BY day ORDER BY day ASC").all();
    return json({total_views:Number(total?.views||0),last_30_days:Number(recent?.views||0),works:works.results||[],daily:daily.results||[]});
  }catch(e){
    console.error('ANALYTICS_QUERY_FAILED',e);
    return json({error:'ANALYTICS_QUERY_FAILED',detail:String((e&&e.message)||e)},500);
  }
}