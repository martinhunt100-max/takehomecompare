// app/api/locations/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // don't cache at build
export async function GET() {
  // read the JSON from /public (served at runtime)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/data/locations.json`).catch(() => null);

  // If runtime fetch fails (e.g. BASE_URL not set in preview), fall back to reading the public file directly.
  // In Next.js, /public is copied to the build output, so this path exists at runtime.
  try {
    if (res?.ok) {
      const data = await res.json();
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    }
  } catch {}

  // direct file import (bundled at build)
  const data = await import("../../../public/data/locations.json").then(m => m.default);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
