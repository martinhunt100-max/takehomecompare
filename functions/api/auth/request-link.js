// Passwordless login: create a magic-link token and (optionally) email it.
// Robust version with diagnostics and clear JSON errors.

export async function onRequestGet({ env }) {
  // Quick diagnostics: open /api/auth/request-link in the browser
  return json({
    ok: true,
    diagnostics: {
      USERS_KV_bound: !!env.USERS_KV,
      PUBLIC_BASE_URL: !!env.PUBLIC_BASE_URL,
      RESEND_API_KEY_present: !!env.RESEND_API_KEY,
      FROM_EMAIL_present: !!env.FROM_EMAIL
    },
    note: "POST { email } to get a magic link. If RESEND_API_KEY is missing, dev_link will be returned in JSON."
  });
}

export async function onRequestPost({ request, env }) {
  try {
    // --- Validate input
    let body = {};
    try { body = await request.json(); } catch { /* ignore */ }
    const email = (body.email || '').trim();
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return json({ error: 'Invalid email' }, 400);
    }

    // --- Validate critical envs
    const base = env.PUBLIC_BASE_URL || 'https://takehomecompare.com';
    if (!env.USERS_KV) {
      return json({
        error: 'KV binding USERS_KV is not configured on this Pages project.',
        how_to_fix: 'Pages → Your project → Settings → Functions → KV namespaces → Add binding with Variable name USERS_KV.'
      }, 500);
    }

    // --- Create token & store in KV
    const token = cryptoRandom(32);
    const now = Date.now();
    const data = { email, created: now, ttl: now + 15 * 60 * 1000 }; // 15 min
    try {
      await env.USERS_KV.put(`magic:${token}`, JSON.stringify(data), { expirationTtl: 15 * 60 });
    } catch (e) {
      return json({
        error: 'KV write failed',
        details: String(e),
        how_to_fix: 'Ensure USERS_KV binding points to a valid KV namespace.'
      }, 500);
    }

    const link = `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;

    // --- If email provider set, send email; otherwise return dev link
    if (env.RESEND_API_KEY) {
      const ok = await sendEmail(env, {
        to: email,
        subject: 'Your sign-in link — TakeHomeCompare',
        html: `<p>Click to sign in:</p><p><a href="${link}">${link}</a></p><p>This link expires in 15 minutes.</p>`
      });
      if (!ok) return json({ error: 'Email send failed' }, 500);
      return json({ ok: true });
    } else {
      // Dev mode: give you the link directly
      return json({ ok: true, dev_link: link });
    }
  } catch (err) {
    return json({ error: 'Unhandled exception', details: String(err) }, 500);
  }
}

/* ------------ helpers ------------ */

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function cryptoRandom(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, '0')).join('');
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
  } catch {
    return false;
  }
}
