import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdvancedPage() {
  const session = await auth();

  if (!session) {
    redirect("/signin?callbackUrl=/advanced");
  }

  // OPTIONAL: Add subscription check if you use lib/subscription.ts
  // const subscribed = await checkSubscription(session.user.email);
  // if (!subscribed) redirect("/subscribe?callbackUrl=/advanced");

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Advanced Calculator</h1>
      <p className="mt-2">Premium calculations for subscribers only.</p>
    </main>
  );
}
