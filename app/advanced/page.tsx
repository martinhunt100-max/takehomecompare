// app/advanced/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import ClientGate from "./ClientGate";

export default async function AdvancedPage() {
  // ❌ Do NOT import or call `auth()` here.
  // Build will only render this shell; auth happens client-side via /api/me.
  return (
    <ClientGate>
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Advanced</h1>
        <p className="mt-2 text-sm text-gray-600">Welcome to the advanced area.</p>
        {/* ...your real advanced content goes here... */}
      </main>
    </ClientGate>
  );
}
