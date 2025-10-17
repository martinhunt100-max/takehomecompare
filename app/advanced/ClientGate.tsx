"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/me", { credentials: "include" });
        if (!r.ok) {
          router.replace("/signin");
          return;
        }
        if (!cancelled) setReady(true);
      } catch {
        router.replace("/signin");
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  if (!ready) return null; // or a small spinner
  return <>{children}</>;
}
