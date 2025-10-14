export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return text('Missing token', 400);

  const raw = await env.USERS_KV.get(`magic:${token}`);
  if (!raw) return text('Invalid or expired link', 400);
  await env.USERS_KV.delete(`magic:${token}`);

  const { email, ttl } = JSON.parse(raw);
  if (Date.now() > ttl) return text('Link expired', 400);

  // Ensure user record exists
  const uid = `u_${hash(email)}`;
  const userKey = `user:${uid}`;
  const existing = await env.USERS_KV.get(userKey, 'json') || {};
  const user = {
    id: uid,
    email,
    stripe_customer_id: existing.stripe_customer_id || null,
    sub_status: existing.sub_status || 'inactive',
    sub_price_id: existing.sub_price_id || null,
    updated: Date.now()
  };
  await env.USERS_KV.put(userKey, JSON.stringify(user));

  // Issue session cookie
  const jwt = makeJWT(env.JWT_SECRET, { uid, email }, 60*60*24*30); // 30 days

  const dest = (env.SUCCESS_URL || 'https://takehomecompare.com/advanced-v2.html');
  return new Response('', {
    status: 302,
    headers: {
      'Location': dest,
      'Set-Cookie': `SESSION_JWT=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*30}`
    }
  });
}

function text(s, status=200) {
  return new Response(s, { status, headers: { 'content-type': 'text/plain' }});
}
function hash(s) {
  const data = new TextEncoder().encode(s);
  // Simple non-crypto hash for stable uid
  let h = 2166136261;
  for (let b of data){ h ^= b; h += (h<<1) + (h<<4) + (h<<7) + (h<<8) + (h<<24); h >>>= 0; }
  return h.toString(16);
}
function base64url(a) {
  return btoa(String.fromCharCode(...a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function makeJWT(secret, payload, maxAgeSec) {
  const enc = new TextEncoder();
  const now = Math.floor(Date.now()/1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { iat: now, exp: now + maxAgeSec, ...payload };
  const h = base64url(enc.encode(JSON.stringify(header)));
  const p = base64url(enc.encode(JSON.stringify(body)));
  const toSign = new TextEncoder().encode(`${h}.${p}`);
  const keyData = enc.encode(secret);
  return crypto.subtle.importKey('raw', keyData, { name:'HMAC', hash:'SHA-256' }, false, ['sign'])
    .then(key => crypto.subtle.sign('HMAC', key, toSign))
    .then(sig => `${h}.${p}.${base64url(new Uint8Array(sig))}`);
}
