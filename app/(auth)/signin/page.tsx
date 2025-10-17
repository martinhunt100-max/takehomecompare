"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        Enter your email to receive a magic link.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await signIn("email", {
            email,
            // after sign-in, send them to Advanced by default
            callbackUrl: "/advanced",
          });
        }}
        className="mt-4 space-y-3"
      >
        <input
          className="w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          required
        />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Email me a sign-in link
        </button>
      </form>
    </main>
  );
}
