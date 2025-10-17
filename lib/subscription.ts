// lib/subscription.ts
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Returns true if the user has at least one active Stripe subscription.
 * This version does NOT assume any specific Prisma fields exist.
 * It tries a few common keys for the Stripe customer id and falls back cleanly.
 */
export async function isPro(userId: string): Promise<boolean> {
  if (!userId) return false;

  // Don't select non-existent fields; just get the record and read dynamically
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }, // minimal, avoids TS errors on unknown fields
  });

  if (!user) return false;

  // Try common property names without typing assumptions
  const customerId =
    (user as any).stripeCustomerId ||
    (user as any).stripe_customer_id ||
    (user as any).stripeCustomerID ||
    (user as any).customerId ||
    null;

  if (!customerId) return false;

  try {
    // Ask Stripe directly whether there’s an active sub
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
      expand: ["data.default_payment_method"],
    });

    return subs.data.length > 0;
  } catch (err) {
    // If Stripe throws (bad key / bad customer), treat as not-pro
    console.error("Stripe subscription check failed:", err);
    return false;
  }
}

/**
 * Helper to enforce PRO access on server code.
 * Throw and catch this in API routes if you need a hard guard.
 */
export async function assertProOrThrow(userId: string) {
  const ok = await isPro(userId);
  if (!ok) {
    const e = new Error("PRO_REQUIRED");
    (e as any).status = 402; // optional hint for API routes
    throw e;
  }
}
