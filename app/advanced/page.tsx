// app/advanced/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Mark dynamic to avoid static pre-render trying to hit Auth/email at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdvancedPage() {
  const session = await auth();

  if (!session) {
    // not signed in: send to sign-in, then come back here
    redirect("/signin?callbackUrl=/advanced");
  }

  // OPTIONAL: If you track subscription in DB, verify here and redirect to /subscribe if needed.
  // const isSubscribed = await checkSubscription(session);
  // if (!isSubscribed) redirect("/subscribe?callbackUrl=/advanced");

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Advanced Calculator</h1>
      {/* ... premium UI ... */}
    </main>
  );
}
