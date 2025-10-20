// app/layout.tsx
import "@/styles/globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TakeHomeCompare",
  description: "Accurate, privacy-friendly take-home pay comparisons."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Load your marketing styles from /styles */}
        <link rel="stylesheet" href="/styles/globals.css" />
        {/* If your CSS file has a different name/path, update the href above */}
      </head>
      <body>{children}</body>
    </html>
  );
}
