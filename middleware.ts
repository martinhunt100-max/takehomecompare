import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Only run on premium endpoints, not public pages
export const config = {
  matcher: ["/advanced/:path*"],
};
