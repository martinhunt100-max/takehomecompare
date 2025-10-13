// Cloudflare Pages Function — Stripe Checkout (no npm deps)
export async function onRequestPost({ env }) {
  const { STRIPE_SECRET_KEY, PRICE_ID, SUCCESS_URL, CANCEL_URL } = env;

  if (!STRIPE_SECRET_KEY || !PRICE_ID) {
    return new Response(
      JSON.stringify({ error: "Missing STRIPE_SECRET_KEY or PRICE_ID" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
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

    const data = await resp.json();

    if (!resp.ok) {
      // Return Stripe's message so you can see exactly what's wrong in the Network tab
      return new Response(
        JSON.stringify({ error: data.error?.message || "Stripe error" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ url: data.url }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
