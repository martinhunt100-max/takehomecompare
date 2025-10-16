export const revalidate = 0;
export const prerender = false;

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ authenticated: false, subscription_active: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { Subscription: true },
  });

  const isPaid =
    !!user?.Subscription &&
    (user.Subscription.status === "active" || user.Subscription.status === "trialing");

  return NextResponse.json({
    authenticated: true,
    subscription_active: isPaid,
    email: user?.email ?? null,
  });
}
