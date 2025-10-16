"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn("email", { email, callbackUrl: "/advanced" });
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="px-4 py-2 rounded bg-black text-white">
          Send magic link
        </button>
      </form>
    </main>
  );
}
