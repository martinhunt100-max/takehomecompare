import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isSubscribed } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    // Not signed in => not subscribed (the /advanced page already redirects if not signed in)
    return NextResponse.json({ subscribed: false });
  }

  try {
    const subscribed = await isSubscribed(session.user.email);
    return NextResponse.json({ subscribed });
  } catch {
    return NextResponse.json({ subscribed: false }, { status: 200 });
  }
}
