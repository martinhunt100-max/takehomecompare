import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  // No auth logic here; we only scope where middleware runs.
  return NextResponse.next();
}

export const config = {
  // Only run on premium paths — the page itself handles auth+sub checks
  matcher: ["/advanced/:path*"],
};
