// app/advanced/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const fetchCache = "force-no-store"; // belt-and-braces to stop caching

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdvancedPage() {
  // ✅ Only call auth() at request time, not at module top-level
  const session = await auth();

  if (!session?.user?.email) {
    // Not logged in — send to your sign-in page
    redirect("/signin");
  }

  // TODO: render your paid/advanced UI here
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Advanced</h1>
      <p className="mt-2 text-sm text-gray-600">
        Welcome back, {session.user.email}
      </p>
    </main>
  );
}
