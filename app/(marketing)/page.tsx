export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

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
            <Link href="/advanced" className="btn">Advanced Calculator →</Link>
          </div>
        </div>
      </header>

      <main className="wrap">
        <h2>Compare your expected <strong>take-home pay</strong> across states and countries in seconds.</h2>

        <div className="card">
          <div className="grid-2">
            <section>
              <h3>Location A</h3>
              <label>Country / US state</label>
              <select defaultValue="">
                <option value="" disabled>Select…</option>
              </select>

              <label>Gross annual salary</label>
              <input defaultValue="90000" />

              <label>Filing / Plan</label>
              <select defaultValue="US: Single">
                <option>US: Single</option>
              </select>

              <label>Pre-tax pension (%)</label>
              <input defaultValue="5" />
              <div className="kpis">
                <span className="chip">Net monthly: —</span>
                <span className="chip">Eff. tax: —</span>
              </div>
            </section>

            <section>
              <h3>Location B</h3>
              <label>Country / US state</label>
              <select defaultValue="">
                <option value="" disabled>Select…</option>
              </select>

              <label>Gross annual salary</label>
              <input defaultValue="90000" />

              <label>Filing / Plan</label>
              <select defaultValue="US: Single">
                <option>US: Single</option>
              </select>

              <label>Pre-tax pension (%)</label>
              <input defaultValue="5" />
              <div className="kpis">
                <span className="chip">Net monthly: —</span>
                <span className="chip">Eff. tax: —</span>
              </div>
            </section>
          </div>

          <button className="btn" style={{ marginTop: 12 }}>Calculate & Compare</button>

          <div style={{ marginTop: 12 }}>
            <Link href="/advanced">Advanced (Subscribers)</Link>{" · "}
            <Link href="/subscribe">Subscribe</Link>
          </div>
        </div>

        <p className="small">
          The calculations and data presented are the most up-to-date available to this site, provided strictly as
          guidance and not financial advice. Do not rely on these figures for significant financial decisions without
          independent verification.
        </p>
      </main>

      <footer>
        © {new Date().getFullYear()} TakeHomeCompare.com · v? · —
      </footer>
    </>
  );
}
