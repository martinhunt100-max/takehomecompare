export const dynamic = "force-dynamic";
export const revalidate = 0;

import Script from "next/script";
import Link from "next/link";

export default function MarketingHome() {
  return (
    <>
      <header>
        <div className="header-inner wrap">
          <div />
          <img
            src="/assets/logo.svg"
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

        {/* BEGIN legacy calculator HTML block */}
        <section id="calculator">
          <h3>Location A</h3>
          <label>Country / US state
            <select id="locA"></select>
          </label>
          <label>Gross annual salary
            <input id="grossA" type="number" inputMode="numeric" defaultValue={90000} />
          </label>
          <label>Filing / Plan
            <select id="optA"></select>
          </label>
          <label>Pre-tax pension (%)
            <input id="penA" type="number" defaultValue={5} />
          </label>
          <div id="resA"><span id="netA">Net monthly: —</span> · <span id="effA">Eff. tax: —</span></div>

          <h3>Location B</h3>
          <label>Country / US state
            <select id="locB"></select>
          </label>
          <label>Gross annual salary
            <input id="grossB" type="number" inputMode="numeric" defaultValue={90000} />
          </label>
          <label>Filing / Plan
            <select id="optB"></select>
          </label>
          <label>Pre-tax pension (%)
            <input id="penB" type="number" defaultValue={5} />
          </label>
          <div id="resB"><span id="netB">Net monthly: —</span> · <span id="effB">Eff. tax: —</span></div>

          <div style={{ marginTop: 12 }}>
            <button id="calc">Calculate & Compare</button>
            <button id="swap" type="button">Swap</button>
            <button id="copyAB" type="button">Copy A → B</button>
          </div>

          <div id="deltaRow" style={{ display: "none", marginTop: 8 }}>
            <strong id="diffBadge"></strong>
            <span id="deltaMonthly"></span> · <span id="deltaAnnual"></span>
            <div id="deltaNote" style={{ fontSize: 12 }}></div>
          </div>
        </section>
        {/* END legacy calculator HTML block */}

        <p className="small" style={{ marginTop: 18 }}>
          The calculations and data presented are the most up-to-date available
          to this site, provided strictly as guidance and not financial advice.
          Do not rely on these figures for significant financial decisions
          without independent verification.
        </p>
      </main>

      <footer>© {new Date().getFullYear()} TakeHomeCompare.com</footer>

      {/* ✅ Load the legacy JS after DOM */}
      <Script src="/js/shared.js" strategy="afterInteractive" />
      <Script src="/js/app.js" strategy="afterInteractive" />
    </>
  );
}
