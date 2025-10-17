// app/pro/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isSubscribed } from "@/lib/subscription";

export default async function ProPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = searchParams?.next || "/advanced";
  const session = await auth();

  if (session?.user?.id && (await isSubscribed(session.user.id as string))) {
    redirect(next);
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Go Pro</h1>
      <p className="mt-2 text-gray-700">
        Subscribe to unlock Advanced Calculations.
      </p>

      <div className="mt-6 flex gap-3">
        {!session?.user && (
          <a
            href={`/signin?next=${encodeURIComponent(next)}`}
            className="rounded-md px-4 py-2 border border-black"
          >
            Sign in
          </a>
        )}

        {/* If you already have an API route for Stripe checkout, post to it */}
        <form action="/api/checkout" method="POST">
          {/* include ?next so you return to the right place after checkout */}
          <input type="hidden" name="next" value={next} />
          <button className="rounded-md px-4 py-2 border border-black" type="submit">
            Subscribe
          </button>
        </form>
      </div>
    </main>
  );
}
