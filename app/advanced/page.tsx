// app/advanced/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isSubscribed } from "@/lib/subscription";

export default async function AdvancedPage() {
  const session = await auth();

  // Not signed in → go sign in first
  if (!session?.user?.id) {
    redirect("/signin?next=/advanced");
  }

  // Signed in but not subscribed → go to subscribe page
  const ok = await isSubscribed(session.user.id as string);
  if (!ok) {
    redirect("/pro?next=/advanced");
  }

  // ✅ Subscribed → show advanced tools
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Advanced Calculations</h1>
      {/* mount your advanced calculator component(s) here */}
      {/* <AdvancedCalculator /> */}
      <p className="mt-2 text-gray-700">
        Welcome! Your subscription unlocks these advanced tools.
      </p>
    </main>
  );
}
