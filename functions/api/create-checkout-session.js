// Cloudflare Pages Function — Stripe Checkout (dependency-free, with diagnostics)

export async function onRequestPost({ request, env }) {
  // Auth gate: require a session (so we can attach to a user)
  const cookie = request.headers.get('Cookie') || '';
  const m = /SESSION_JWT=([^;]+)/.exec(cookie);
  if (!m) return json({ error: 'Not signed in' }, 401);

  const me = await verifyJWT(env.JWT_SECRET, m[1]).catch(()=>null);
  if (!me) return json({ error: 'Invalid session' }, 401);

  const userKey = `user:${me.uid}`;
  const user = await env.USERS_KV.get(userKey, 'json');
  const successUrl = env.SUCCESS_URL || `${env.PUBLIC_BASE_URL || 'https://takehomecompare.com'}/advanced-v2.html`;
  const cancelUrl  = env.CANCEL_URL  || `${env.PUBLIC_BASE_URL || 'https://takehomecompare.com'}/`;

  const form = new URLSearchParams();
  form.append('mode', 'subscription');
  form.append('line_items[0][price]', env.STRIPE_PRICE_ID);
  form.append('line_items[0][quantity]', '1');
  form.append('allow_promotion_codes', 'true');
  form.append('success_url', successUrl);
  form.append('cancel_url', cancelUrl);

  if (user?.stripe_customer_id) {
    form.append('customer', user.stripe_customer_id);
  } else {
    // Ask Stripe to create + attach customer from email
    form.append('customer_email', user?.email || me.email || '');
  }

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString()
  });

  const data = await resp.json().catch(()=>({}));
  if (!resp.ok) return json({ error: data?.error?.message || 'Stripe error', status: resp.status }, 500);

  return json({ url: data.url });
}

async function verifyJWT(secret, token){
  const [h,p,s] = token.split('.');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['verify']);
  const ok = await crypto.subtle.verify('HMAC', key, b64uToBytes(s), enc.encode(`${h}.${p}`));
  if (!ok) return null;
  const body = JSON.parse(new TextDecoder().decode(b64uToBytes(p)));
  if (body.exp && Math.floor(Date.now()/1000) > body.exp) return null;
  return body;
}
function b64uToBytes(b){ b=b.replace(/-/g,'+').replace(/_/g,'/'); while(b.length%4)b+='='; const bin=atob(b); const out=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i); return out; }
function json(obj, status=200){ return new Response(JSON.stringify(obj), { status, headers:{'content-type':'application/json'}}); }
