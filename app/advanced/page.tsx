import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientGate from "./ClientGate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdvancedPage() {
  const session = await auth();
  if (!session) {
    redirect("/signin?callbackUrl=/advanced");
  }

  return (
    <ClientGate>
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Advanced Calculator</h1>
        <p className="mt-2">Premium calculations for subscribers only.</p>

        {/* TODO: your advanced / premium UI goes here */}
      </main>
    </ClientGate>
  );
}
