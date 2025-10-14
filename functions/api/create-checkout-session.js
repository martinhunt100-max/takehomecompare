// Cloudflare Pages Function — Create Stripe Checkout Session
// - Requires a signed session cookie (SESSION_JWT) set by your auth flow
// - Uses env.PRICE_ID (your recurring price), not STRIPE_PRICE_ID
// - No Stripe SDK: uses fetch to Stripe API
// - Always returns JSON { url } or { error }

export async function onRequestPost({ request, env }) {
  // 1) Require an authenticated session
  const cookie = request.headers.get('Cookie') || '';
  const m = /SESSION_JWT=([^;]+)/.exec(cookie);
  if (!m) return json({ error: 'Not signed in' }, 401);

  const me = await verifyJWT(env.JWT_SECRET, m[1]).catch(() => null);
  if (!me) return json({ error: 'Invalid session' }, 401);

  // 2) Load user record from KV (created by auth/verify)
  const userKey = `user:${me.uid}`;
  const user = await env.USERS_KV.get(userKey, 'json');

  // 3) Build Checkout payload
  const base = env.PUBLIC_BASE_URL || 'https://takehomecompare.com';
  const successUrl = env.SUCCESS_URL || `${base}/advanced-v2.html`;
  const cancelUrl  = env.CANCEL_URL  || `${base}/`;

  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Missing STRIPE_SECRET_KEY' }, 500);
  if (!env.PRICE_ID)          return json({ error: 'Missing PRICE_ID' }, 500);

  const form = new URLSearchParams();
  form.append('mode', 'subscription');
  form.append('line_items[0][price]', env.PRICE_ID);
  form.append('line_items[0][quantity]', '1');
  form.append('allow_promotion_codes', 'true');
  form.append('success_url', successUrl);
  form.append('cancel_url',  cancelUrl);

  // Prefer attaching known Stripe customer; otherwise let Stripe create one from email
  if (user?.stripe_customer_id) {
    form.append('customer', user.stripe_customer_id);
  } else {
    const email = user?.email || me.email || '';
    if (email) form.append('customer_email', email);
  }

  // 4) Call Stripe
  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString()
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return json({
      error: data?.error?.message || 'Stripe error',
      status: resp.status
    }, 500);
  }

  return json({ url: data.url });
}

/* ---------------- helpers ---------------- */

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

async function verifyJWT(secret, token) {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) throw new Error('Bad token');
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    b64uToBytes(s),
    enc.encode(`${h}.${p}`)
  );
  if (!ok) throw new Error('Bad signature');

  const body = JSON.parse(new TextDecoder().decode(b64uToBytes(p)));
  if (body.exp && Math.floor(Date.now()/1000) > body.exp) {
    throw new Error('Token expired');
  }
  return body; // { uid, email, iat, exp, ... }
}

function b64uToBytes(b64u) {
  let b = b64u.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  const bin = atob(b);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
