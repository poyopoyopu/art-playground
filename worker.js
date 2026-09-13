import { onRequestPost } from './functions/api/vote.js';
import { onRequestGet } from './functions/api/results.js';

const CLOCK_SPEC_PATHS = new Set([
  '/art-v27.html',
  '/art-v28-living-order.html',
  '/art-v30-standing-law.html',
  '/art-v31-divided-law.html'
]);

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

    const response = await env.ASSETS.fetch(request);

    // Normalize the four legacy clocks to the house spec.
    // Do not depend on the exact legacy assignment syntax: inject a tiny
    // observer that wins over the old Japanese formatter even if it runs later.
    if (request.method === 'GET' && CLOCK_SPEC_PATHS.has(url.pathname)) {
      const type = response.headers.get('content-type') || '';
      if (type.includes('text/html')) {
        let html = await response.text();
        const clockFix = `<script>(function(){var el=document.getElementById('clockDate');if(!el)return;function fmt(){var d=new Date(),w=['SUN','MON','TUE','WED','THU','FRI','SAT'];return d.getFullYear()+' '+String(d.getMonth()+1).padStart(2,'0')+' '+String(d.getDate()).padStart(2,'0')+' '+w[d.getDay()];}function set(){var v=fmt();if(el.textContent!==v)el.textContent=v;}new MutationObserver(set).observe(el,{childList:true,characterData:true,subtree:true});set();setInterval(set,1000);}());</script>`;
        html = html.replace(/<\/body>/i, clockFix + '</body>');
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        headers.delete('ETag');
        return new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }
    }

    return response;
  }
};
