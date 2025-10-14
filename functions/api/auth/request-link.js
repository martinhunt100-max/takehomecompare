export async function onRequestPost({ request, env }) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return json({ error: 'Invalid email' }, 400);
    }
    const token = cryptoRandom(32);
    const now = Date.now();
    const data = { email, created: now, ttl: now + 15*60*1000 }; // 15 min

    await env.USERS_KV.put(`magic:${token}`, JSON.stringify(data), { expirationTtl: 15*60 });

    const base = env.PUBLIC_BASE_URL || 'https://takehomecompare.com';
    const link = `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;

    // Send email (Resend)
    const ok = await sendEmail(env, {
      to: email,
      subject: 'Your sign-in link — TakeHomeCompare',
      html: `<p>Click to sign in:</p><p><a href="${link}">${link}</a></p><p>This link expires in 15 minutes.</p>`
    });

    if (!ok) return json({ error: 'Email send failed' }, 500);
    return json({ ok: true });
  } catch (e) {
    return json({ error: 'Request failed' }, 500);
  }
}

function cryptoRandom(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2,'0')).join('');
}

async function sendEmail(env, { to, subject, html }) {
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || 'login@takehomecompare.com',
        to, subject, html
      })
    });
    return r.ok;
  } catch { return false; }
}

function json(obj, status=200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { 'content-type': 'application/json' }
  });
}
