import Link from "next/link";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";


export default function Home() {
return (
<main className="p-6 max-w-3xl mx-auto">
<h1 className="text-2xl font-semibold mb-4">TakeHomeCompare</h1>
<p className="mb-6">Accurate, privacy-friendly take-home pay comparisons.</p>
<div className="flex gap-3">
<Link href="/signin" className="px-3 py-2 rounded border">Sign in</Link>
<Link href="/advanced" className="px-3 py-2 rounded bg-black text-white">Open App</Link>
</div>
<LegalDisclaimer />
</main>
);
}
