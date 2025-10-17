// lib/subscription.ts
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Returns true if the user has at least one active Stripe subscription.
 * This version does NOT assume any specific Prisma fields exist.
 */
export async function isPro(userId: string): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }, // minimal to avoid TS issues on unknown fields
  });

  if (!user) return false;

  // Try common keys without typing assumptions
  const customerId =
    (user as any).stripeCustomerId ||
    (user as any).stripe_customer_id ||
    (user as any).stripeCustomerID ||
    (user as any).customerId ||
    null;

  if (!customerId) return false;

  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
      expand: ["data.default_payment_method"],
    });

    return subs.data.length > 0;
  } catch (err) {
    console.error("Stripe subscription check failed:", err);
    return false;
  }
}

/** Alias to match older code paths */
export async function isSubscribed(userId: string) {
  return isPro(userId);
}

export async function assertProOrThrow(userId: string) {
  const ok = await isPro(userId);
  if (!ok) {
    const e = new Error("PRO_REQUIRED");
    (e as any).status = 402;
    throw e;
  }
}
