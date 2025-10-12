export async function onRequestPost({ env, request }) {
  try {
    const { STRIPE_SECRET_KEY, PRICE_ID, SUCCESS_URL, CANCEL_URL } = env;
    if (!STRIPE_SECRET_KEY || !PRICE_ID) {
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY or PRICE_ID' }), { status: 500 });
    }

    const stripeMod = await import('stripe');
    const stripe = new stripeMod.default(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: SUCCESS_URL || 'https://takehomecompare.com/advanced-v2.html?pro=1',
      cancel_url:  CANCEL_URL  || 'https://takehomecompare.com/',
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

