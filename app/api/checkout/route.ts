import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export const runtime = "nodejs";


export async function POST() {
const session = await auth();
if (!session?.user?.email) return NextResponse.json({ error: "Not signed in" }, { status: 401 });


const user = await prisma.user.upsert({
where: { email: session.user.email },
update: {},
create: { email: session.user.email }
});


if (!user.stripeCustomerId) {
const customer = await stripe.customers.create({ email: session.user.email });
await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
}


const price = process.env.STRIPE_PRICE_BASIC!;
const base = process.env.NEXT_PUBLIC_SITE_URL!;


const checkout = await stripe.checkout.sessions.create({
mode: "subscription",
line_items: [{ price, quantity: 1 }],
allow_promotion_codes: true,
customer: (await prisma.user.findUnique({ where: { id: user.id } }))!.stripeCustomerId!,
success_url: `${base}/advanced`,
cancel_url: `${base}/` ,
metadata: { userId: user.id }
});


return NextResponse.json({ url: checkout.url });
}
