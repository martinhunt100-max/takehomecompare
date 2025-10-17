// app/(marketing)/page.tsx
export const dynamic = "force-static";
export const revalidate = 60;

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">TakeHomeCompare</h1>
      <p className="mt-2 text-gray-700">
        Accurate, privacy-friendly take-home pay comparisons.
      </p>

      <div className="mt-6 flex gap-3">
        <a href="/open" className="rounded-md px-4 py-2 border border-black">
          Open App
        </a>
        <a href="/advanced" className="rounded-md px-4 py-2 border border-black">
          Advanced
        </a>
      </div>

      <p className="mt-8 text-sm text-gray-600">
        The calculations and data presented are the most up-to-date available to
        this site, provided strictly as guidance and not financial advice. Do not
        rely on these figures for significant financial decisions without
        independent verification.
      </p>
    </main>
  );
}

