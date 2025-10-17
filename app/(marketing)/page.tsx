import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">TakeHomeCompare</h1>
      <p className="mt-2">Free basic calculator.</p>

      {/* TODO: your free/basic calculator UI here */}

      <div className="mt-6">
        <Link
          href="/advanced"
          className="inline-block rounded bg-black px-4 py-2 text-white"
        >
          Advanced (Subscribers)
        </Link>
      </div>
    </main>
  );
}
