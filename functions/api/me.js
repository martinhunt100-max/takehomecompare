export async function onRequestGet({ request, env }) {
  const cookie = request.headers.get('Cookie') || '';
  const m = /SESSION_JWT=([^;]+)/.exec(cookie);
  if (!m) return json({ authenticated:false, subscription_active:false });

  const jwt = m[1];
  const data = await verifyJWT(env.JWT_SECRET, jwt).catch(()=>null);
  if (!data) return json({ authenticated:false, subscription_active:false });

  const user = await env.USERS_KV.get(`user:${data.uid}`, 'json');
  const active = !!user && (user.sub_status === 'active' || user.sub_status === 'trialing');
  return json({ authenticated:true, subscription_active: active, email: user?.email || null });
}

function json(obj, status=200){
  return new Response(JSON.stringify(obj), { status, headers:{'content-type':'application/json'}});
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
function b64uToBytes(b){
  b = b.replace(/-/g,'+').replace(/_/g,'/'); while(b.length%4) b+='=';
  const bin = atob(b); const out = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}
