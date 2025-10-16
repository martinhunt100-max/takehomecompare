// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { auth as authConfig } from "@/auth"; // reuse your NextAuth config
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authConfig as any);
  if (!session?.user?.email) return res.status(401).json({ error: "Not authenticated" });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const priceId = process.env.STRIPE_PRICE_BASIC;
  if (!priceId) return res.status(500).json({ error: "Missing STRIPE_PRICE_BASIC" });

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${process.env.NEXTAUTH_URL}/advanced?status=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/advanced?status=cancelled`,
    customer_email: session.user.email!,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: user.id },
  });

  return res.status(200).json({ url: checkout.url });
}
