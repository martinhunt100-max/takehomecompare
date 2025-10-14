export const config = {
  // Needed to get the raw body for signature verification
  // (for Pages Functions, this ensures we don't parse JSON first)
};

export async function onRequestPost({ request, env }) {
  const sig = request.headers.get('Stripe-Signature');
  if (!sig) return json({ error:'Missing signature' }, 400);

  const raw = await request.arrayBuffer();
  const payload = new TextDecoder().decode(raw);

  const ok = await verifyStripeSig(env.STRIPE_WEBHOOK_SECRET, sig, payload);
  if (!ok) return json({ error:'Bad signature' }, 400);

  const evt = JSON.parse(payload);

  try {
    if (evt.type === 'checkout.session.completed') {
      const s = evt.data.object;
      const email = s.customer_details?.email || s.customer_email || null;
      const customer = s.customer; // cus_...
      if (email && customer) await upsertUserByEmail(env, email, { stripe_customer_id: customer });
    }

    if (evt.type === 'customer.subscription.created' ||
        evt.type === 'customer.subscription.updated' ||
        evt.type === 'customer.subscription.deleted') {
      const sub = evt.data.object;
      const customer = sub.customer; // cus_...
      const status = sub.status;     // trialing, active, past_due, canceled, etc.
      const price = sub.items?.data?.[0]?.price?.id || null;

      await updateUserByCustomer(env, customer, {
        sub_status: status === 'active' || status === 'trialing' ? status : (status || 'inactive'),
        sub_price_id: price
      });
    }

    return json({ received: true });
  } catch (e) {
    return json({ error: 'handler failed', details: String(e) }, 500);
  }
}

// --- helpers ---
async function verifyStripeSig(secret, header, payload) {
  // Stripe sends multiple timestamps & signatures; we verify any v1 signature
  const parts = Object.fromEntries(header.split(',').map(kv => kv.split('=')));
  const v1 = (header.match(/v1=([a-f0-9]+)/g) || []).map(s => s.slice(3));
  const timestamp = parts.t;
  if (!timestamp || !v1.length) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const sigHex = [...new Uint8Array(sigBytes)].map(b=>b.toString(16).padStart(2,'0')).join('');

  return v1.some(s => timingSafeEq(sigHex, s));
}
function timingSafeEq(a,b){
  if (a.length !== b.length) return false;
  let r = 0; for(let i=0;i<a.length;i++){ r |= a.charCodeAt(i)^b.charCodeAt(i); }
  return r === 0;
}

async function upsertUserByEmail(env, email, patch){
  const uid = `u_${hash(email)}`;
  const key = `user:${uid}`;
  const cur = await env.USERS_KV.get(key, 'json') || { id:uid, email };
  const next = { ...cur, ...patch, updated: Date.now() };
  await env.USERS_KV.put(key, JSON.stringify(next));
  // after put:
if (next.stripe_customer_id) {
  await env.USERS_KV.put(`customer:${next.stripe_customer_id}`, next.id);
}
async function updateUserByCustomer(env, customerId, patch){
  // KV has no secondary index, so we store a reverse index too
  const uid = await env.USERS_KV.get(`customer:${customerId}`);
  if (uid) {
    const key = `user:${uid}`;
    const cur = await env.USERS_KV.get(key, 'json');
    if (cur) {
      const next = { ...cur, ...patch, updated: Date.now() };
      await env.USERS_KV.put(key, JSON.stringify(next));
      return;
    }
  }
  // fallback: we need to find the user by scanning (cheap at small scale),
  // or better: write the reverse index when we first learn customer id:
  // save mapping now if we can infer uid by email (omitted here).
}
function hash(s){ const data=new TextEncoder().encode(s); let h=2166136261; for(let b of data){ h^=b; h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24); h>>>=0;} return h.toString(16); }
function json(obj, status=200){ return new Response(JSON.stringify(obj), { status, headers:{'content-type':'application/json'}}); }
