// Cloudflare Pages Function — Stripe Checkout (dependency-free, with diagnostics)

export async function onRequestGet({ env }) {
  // Diagnostics: visit /api/create-checkout-session?diag=1 in your browser
  const url = new URL('http://x' + (typeof location === 'undefined' ? '' : location)); // ignore
  // In Pages Functions, use the current request URL instead:
  // (We can't access it here without context.request, so parse from env presence only.)
  const hasSK  = !!env.STRIPE_SECRET_KEY;
  const hasPID = !!env.PRICE_ID;
  const ok = hasSK && hasPID;
  return new Response(JSON.stringify({
    ok,
    STRIPE_SECRET_KEY_present: hasSK,
    PRICE_ID_present: hasPID,
    note: "POST to this endpoint to create a Checkout Session. Set env vars in Pages → Settings → Environment variables (Production)."
  }), { headers: { "content-type": "application/json" }});
}

export async function onRequestPost({ env }) {
  const { STRIPE_SECRET_KEY, PRICE_ID, SUCCESS_URL, CANCEL_URL } = env;

  // Validate env vars clearly
  if (!STRIPE_SECRET_KEY || !PRICE_ID) {
    return new Response(JSON.stringify({
      error: "Missing required environment variables",
      details: {
        STRIPE_SECRET_KEY_present: !!STRIPE_SECRET_KEY,
        PRICE_ID_present: !!PRICE_ID,
        how_to_fix: "In Cloudflare Pages → Your project → Settings → Environment variables (Production), add STRIPE_SECRET_KEY and PRICE_ID (recurring price, e.g., price_123). Optionally SUCCESS_URL and CANCEL_URL."
      }
    }), { status: 500, headers: { "content-type": "application/json" }});
  }

  try {
    const form = new URLSearchParams();
    form.append("mode", "subscription");
    form.append("line_items[0][price]", PRICE_ID);
    form.append("line_items[0][quantity]", "1");
    form.append("allow_promotion_codes", "true");
    form.append("success_url", SUCCESS_URL || "https://takehomecompare.com/advanced-v2.html?pro=1");
    form.append("cancel_url",  CANCEL_URL  || "https://takehomecompare.com/");

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      // Surface Stripe’s error text so you know exactly what to fix
      return new Response(JSON.stringify({
        error: data?.error?.message || "Stripe API error",
        status: resp.status,
        hint: "Double-check PRICE_ID (must be a recurring price) and that your secret key can create Checkout Sessions."
      }), { status: 500, headers: { "content-type": "application/json" }});
    }

    return new Response(JSON.stringify({ url: data.url }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: "Function exception",
      details: String(err)
    }), { status: 500, headers: { "content-type": "application/json" }});
  }
}
