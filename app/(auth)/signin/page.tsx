// app/(auth)/signin/page.tsx
export const dynamic = "force-dynamic";

"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";


export default function SignIn() {
const [email, setEmail] = useState("");
const [sent, setSent] = useState(false);
const submit = async (e: React.FormEvent) => {
e.preventDefault();
await signIn("email", { email, redirect: true, callbackUrl: "/advanced" });
setSent(true);
};
return (
<main className="p-6 max-w-md mx-auto">
<h1 className="text-xl font-semibold mb-4">Sign in</h1>
{sent ? (
<p>Check your inbox for the sign-in link.</p>
) : (
<form onSubmit={submit} className="flex gap-2">
<input className="border p-2 flex-1" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
<button className="px-4 py-2 bg-black text-white rounded">Send link</button>
</form>
)}
</main>
);
}
