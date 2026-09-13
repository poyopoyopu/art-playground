import { onRequestPost } from './functions/api/vote.js';
import { onRequestGet } from './functions/api/results.js';

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
    return env.ASSETS.fetch(request);
  }
};
