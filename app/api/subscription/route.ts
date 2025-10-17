// app/api/subscription/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isSubscribed } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const userId =
    (session as any)?.user?.id ||
    (session as any)?.userId ||
    (session as any)?.sub ||
    null;

  const subscribed = userId ? await isSubscribed(userId) : false;

  return NextResponse.json({ subscribed, userId });
}
