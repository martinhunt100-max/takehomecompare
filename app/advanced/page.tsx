export const dynamic = "force-dynamic";
import { auth } from "@/auth";            // ❗ change from 'next-auth'
import { prisma } from "@/lib/prisma";
import { GoProButton } from "@/components/GoProButton";

export default async function Advanced() {
  const session = await auth();
  if (!session?.user?.email) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <p>Please <a className="underline" href="/signin">sign in</a>.</p>
      </main>
    );
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { Subscription: true }
  });
  const isPaid =
    !!user?.Subscription &&
    (user.Subscription.status === "active" || user.Subscription.status === "trialing");

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Advanced Calculator</h1>
      {isPaid ? (
        <div className="border rounded p-4">/* TODO: your full calculator UI here */</div>
      ) : (
        <div className="space-y-4">
          <p>Upgrade to unlock advanced comparisons.</p>
          <GoProButton />
        </div>
      )}
    </main>
  );
}
