"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SubState = "checking" | "subscribed" | "not-subscribed" | "error";

export default function ClientGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SubState>("checking");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/subscription", { cache: "no-store" });
        if (!alive) return;
        if (!res.ok) {
          setState("error");
          return;
        }
        const data = (await res.json()) as { subscribed: boolean };
        setState(data.subscribed ? "subscribed" : "not-subscribed");
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p>Checking your subscription…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p>We couldn’t verify your subscription right now. Please try again.</p>
        <div className="mt-4">
          <Link href="/signin" className="underline">
            Sign in again
          </Link>
        </div>
      </div>
    );
  }

  if (state === "not-subscribed") {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Advanced requires a subscription</h1>
        <p className="mt-2">
          You’re signed in, but you don’t have an active subscription yet.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/pro"
            className="inline-block rounded bg-black px-4 py-2 text-white"
          >
            Subscribe
          </Link>
          <Link href="/" className="inline-block rounded border px-4 py-2">
            Back to free calculator
          </Link>
        </div>
      </div>
    );
  }

  // subscribed
  return <>{children}</>;
}
