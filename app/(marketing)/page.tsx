export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import BasicCalculator from "@/components/BasicCalculator";

export default function MarketingHome() {
  return (
    <>
      <header>
        <div className="header-inner wrap">
          <div />
          <img
            src="/assets/logo.png"
            alt="Take Home Compare"
            className="logo"
          />
          <div className="cta">
            <Link href="/advanced" className="btn">
              Advanced Calculator →
            </Link>
          </div>
        </div>
      </header>

      <main className="wrap">
        <h2>
          Compare your expected <strong>take-home pay</strong> across states
          and countries in seconds.
        </h2>

        {/* Styled calculator */}
        <BasicCalculator />

        <div style={{ marginTop: 12 }}>
          <Link href="/advanced">Advanced (Subscribers)</Link>{" · "}
          <Link href="/subscribe">Subscribe</Link>
        </div>

        <p className="small" style={{ marginTop: 18 }}>
          The calculations and data presented are the most up-to-date available
          to this site, provided strictly as guidance and not financial advice.
          Do not rely on these figures for significant financial decisions
          without independent verification.
        </p>
      </main>

      <footer>© {new Date().getFullYear()} TakeHomeCompare.com · v? · —</footer>
    </>
  );
}
