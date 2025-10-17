// lib/subscription.ts
import { prisma } from "@/lib/prisma";

export async function isSubscribed(userId: string) {
  if (!userId) return false;

  // ✅ Adjust to your schema if needed
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      // If you track expiry, also ensure it's in the future, e.g.:
      // currentPeriodEnd: { gt: new Date() }
    },
    select: { id: true },
  });

  return Boolean(sub);
}
