import { onRequestPost } from './functions/api/vote.js';
import { onRequestGet } from './functions/api/results.js';

// SOCIAL_LINKS_DEPLOY_CHECK: 2026-09-14
const SOCIAL_CSS = `
  /* ---------- social ---------- */
  .social{
    margin:42px 2px 0;
    padding:26px 8px 4px;
    position:relative;
    text-align:center;
    border-top:1px solid var(--line-2);
  }
  .social::before{
    content:"";
    position:absolute;
    top:-1px; left:50%; width:56px; height:1px;
    transform:translateX(-50%);
    background:linear-gradient(90deg,var(--a),var(--b));
    box-shadow:0 0 12px rgba(122,217,255,.16);
  }
  .social-kicker{
    margin:0 0 10px;
    font-size:9px;
    letter-spacing:.28em;
    color:var(--text-3);
  }
  .social h2{
    margin:0;
    font-size:16px;
    line-height:1.5;
    font-weight:700;
    letter-spacing:-.02em;
  }
  .social p{
    margin:8px auto 16px;
    max-width:38ch;
    color:var(--text-2);
    font-size:11px;
    line-height:1.7;
  }
  .social-links{
    display:flex;
    justify-content:center;
    gap:10px;
    flex-wrap:wrap;
  }
  .social-link{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    min-width:112px;
    min-height:40px;
    padding:0 18px;
    border:1px solid rgba(255,255,255,.10);
    border-radius:999px;
    background:rgba(255,255,255,.025);
    color:var(--text-1);
    font-size:10.5px;
    font-weight:700;
    letter-spacing:.05em;
    transition:transform .15s ease, border-color .15s ease, background .15s ease;
  }
  .social-link:active{ transform:scale(.97); }
  @media (hover:hover){
    .social-link:hover{
      border-color:rgba(122,217,255,.24);
      background:linear-gradient(135deg,rgba(122,217,255,.08),rgba(255,122,217,.07));
    }
  }
`;

const SOCIAL_HTML = `
  <section class="social" aria-label="ART PLAYGROUND social links">
    <div class="social-kicker mono">FOLLOW THE PLAYGROUND</div>
    <h2>作品の変化を追う。</h2>
    <p>新しい作品、実験、変化の記録をSNSで公開しています。</p>
    <div class="social-links">
      <a class="social-link" href="https://www.instagram.com/artplayground.art/" target="_blank" rel="noopener noreferrer">Instagram</a>
      <a class="social-link" href="https://www.tiktok.com/@artplayground.art" target="_blank" rel="noopener noreferrer">TikTok</a>
    </div>
  </section>
`;

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

    const asset = await env.ASSETS.fetch(request);

    // Add the social section only to the gallery page, without touching the artwork files.
    if ((url.pathname === '/' || url.pathname === '/index.html') && asset.ok) {
      const contentType = asset.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const html = await asset.text();
        const enhanced = html
          .replace('</style>', `${SOCIAL_CSS}</style>`)
          .replace('<section class="support">', `${SOCIAL_HTML}<section class="support">`);
        return new Response(enhanced, {
          status: asset.status,
          statusText: asset.statusText,
          headers: asset.headers
        });
      }
    }

    return asset;
  }
};
