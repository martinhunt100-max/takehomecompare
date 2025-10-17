// app/(marketing)/page.tsx
import Link from "next/link";

export default function MarketingHome() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">TakeHomeCompare</h1>
      <p className="text-neutral-700 mb-6">
        Accurate, privacy-friendly take-home pay comparisons.
      </p>

      {/* Free/basic calculator content goes here */}
      <section className="rounded-xl border p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">Free basic calculator</h2>
        <p className="text-sm text-neutral-700 mb-4">
          Enter your details to get a quick estimate.
        </p>
        {/* TODO: your existing basic calculator UI */}
        <div className="text-sm text-neutral-600">
          (Basic calculator component placeholder)
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Link
          href="/advanced"
          className="underline underline-offset-4"
        >
          Advanced (Subscribers)
        </Link>
        <Link
          href="/pro"
          className="underline underline-offset-4"
        >
          Subscribe
        </Link>
      </div>

      <p className="mt-10 text-xs text-neutral-600">
        The calculations and data presented are the most up-to-date available to this
        site, provided strictly as guidance and not financial advice. Do not rely on
        these figures for significant financial decisions without independent verification.
      </p>
    </main>
  );
}
