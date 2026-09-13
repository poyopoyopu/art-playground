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

    // Add social links only to the gallery page.
    if ((url.pathname === '/' || url.pathname === '/index.html') && asset.ok) {
      const contentType = asset.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const html = await asset.text();
        const enhanced = html
          .replace('</style>', `${SOCIAL_CSS}</style>`)
          .replace(/<section class="support"[^>]*>/, `${SOCIAL_HTML}$&`);

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
