import { prisma } from "./prisma";

/**
 * Determine if the given email has an active subscription.
 * Adjust this to your actual schema/fields.
 */
export async function isSubscribed(email: string): Promise<boolean> {
  // Temporary override: allow making everything free during testing
  if (process.env.FEATURE_SUBSCRIPTION_OFF === "1") return true;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      // Add/rename these to match your schema
      id: true,
      stripeCustomerId: true as any,
      stripeSubscriptionStatus: true as any,
      plan: true as any,
      subscriptionActive: true as any,
    },
  });

  if (!user) return false;

  // Common ways teams mark "active"
  // - boolean subscriptionActive
  // - plan === "pro"
  // - stripeSubscriptionStatus === "active" or "trialing"
  const status =
    (user as any).subscriptionActive === true ||
    (user as any).plan === "pro" ||
    ["active", "trialing"].includes((user as any).stripeSubscriptionStatus);

  return Boolean(status);
}
