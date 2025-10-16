export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const prerender = false;
import { NextResponse } from "next/server";
export async function GET() {
try {
const data = await fetch(new URL("/data/rates.json", process.env.NEXT_PUBLIC_SITE_URL)).then(r => r.json());
return NextResponse.json(data);
} catch {
return NextResponse.json({ version: "v1", data: [] });
}
}
