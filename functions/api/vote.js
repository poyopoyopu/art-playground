const WORKS = new Set([
  'INFECTION','VOID FIELD II','ART OF BECOMING','ONE KNOT','DIVIDED LAW',
  'STANDING LAW','LIVING ORDER','PARTICLE COSMOS II','ALIVE','INK BLOOM'
]);

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra }
  });
}

function cookieId() {
  return crypto.randomUUID();
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'DB_NOT_CONFIGURED' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'INVALID_JSON' }, 400); }
  if (!Array.isArray(body.votes) || body.votes.length !== 10) return json({ error: '10_VOTES_REQUIRED' }, 400);

  const clean = [];
  for (const v of body.votes) {
    if (!v || typeof v.work !== 'string' || !WORKS.has(v.work) || !Number.isInteger(v.rating) || v.rating < 1 || v.rating > 5) {
      return json({ error: 'INVALID_VOTE' }, 400);
    }
    clean.push([v.work, v.rating]);
  }
  if (new Set(clean.map(x => x[0])).size !== 10) return json({ error: 'DUPLICATE_WORK' }, 400);

  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)ap_voter=([^;]+)/);
  const voter = match ? decodeURIComponent(match[1]) : cookieId();

  const exists = await env.DB.prepare('SELECT 1 FROM voters WHERE voter_id = ?').bind(voter).first();
  if (exists) return json({ error: 'ALREADY_VOTED' }, 409);

  const now = new Date().toISOString();
  const stmts = [env.DB.prepare('INSERT INTO voters (voter_id, created_at) VALUES (?, ?)').bind(voter, now)];
  for (const [work, rating] of clean) {
    stmts.push(env.DB.prepare('INSERT INTO votes (voter_id, work, rating, created_at) VALUES (?, ?, ?, ?)').bind(voter, work, rating, now));
  }
  try { await env.DB.batch(stmts); } catch (e) { return json({ error: 'SAVE_FAILED' }, 500); }

  return json({ ok: true }, 200, { 'set-cookie': `ap_voter=${encodeURIComponent(voter)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure` });
}
