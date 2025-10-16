export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const prerender = false;
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function POST(req: Request) {
const sig = req.headers.get("stripe-signature");
if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });


const raw = await req.text();
let event;
try {
event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
} catch (e: any) {
return NextResponse.json({ error: e.message }, { status: 400 });
}


try {
switch (event.type) {
case "checkout.session.completed": {
const s = event.data.object as any;
const email = s.customer_details?.email || s.customer_email;
const customer = s.customer as string;
if (email && customer) {
await prisma.user.upsert({
where: { email },
update: { stripeCustomerId: customer },
create: { email, stripeCustomerId: customer }
});
}
break;
}
case "customer.subscription.created":
case "customer.subscription.updated": {
const sub = event.data.object as any; // Stripe.Subscription
const customerId = sub.customer as string;
const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
if (user) {
await prisma.subscription.upsert({
where: { userId: user.id },
update: {
id: sub.id,
status: sub.status,
priceId: sub.items?.data?.[0]?.price?.id || null,
currentPeriodEnd: BigInt(sub.current_period_end || 0)
},
create: {
id: sub.id,
userId: user.id,
status: sub.status,
priceId: sub.items?.data?.[0]?.price?.id || null,
currentPeriodEnd: BigInt(sub.current_period_end || 0)
}
});
}
break;
}
case "customer.subscription.deleted": {
const sub = event.data.object as any;
const customerId = sub.customer as string;
const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
if (user) {
await prisma.subscription.update({
where: { userId: user.id },
data: { status: "canceled" }
}).catch(() => {});
}
break;
}
}
} catch (e) {
return NextResponse.json({ error: "handler failed", details: String(e) }, { status: 500 });
}


return NextResponse.json({ received: true });
}
