// app/(marketing)/page.tsx
import Link from "next/link";

export default function MarketingHome() {
  return (
    <main>
      {/* Simple top bar with logo and premium CTA */}
      <header className="thc-header">
        <div className="thc-header__inner">
          <Link href="/" className="thc-logo">
            {/* If you have a logo in /public/assets/logo.svg it will render */}
            <img src="/assets/logo.svg" alt="Take Home Compare" />
          </Link>

          <nav className="thc-nav">
            <Link href="/pro" className="thc-btn thc-btn--primary">
              Advanced Calculator →
            </Link>
          </nav>
        </div>
      </header>

      {/* Tagline / hero */}
      <section className="thc-hero">
        <h1>
          Compare your expected <strong>take-home pay</strong> across states and countries in seconds.
        </h1>
      </section>

      {/* FREE BASIC CALCULATOR */}
      <section className="thc-card thc-grid">
        {/* Location A */}
        <div className="thc-col">
          <h2>Location A</h2>

          <label>Country / US state</label>
          <select defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            <option>US — California</option>
            <option>US — New York</option>
            <option>UK</option>
            <option>Canada — Ontario</option>
          </select>

          <label>Gross annual salary</label>
          <input type="number" defaultValue={90000} />

          <label>Filing / Plan</label>
          <select defaultValue="US: Single">
            <option>US: Single</option>
            <option>US: Married Filing Jointly</option>
            <option>UK: PAYE</option>
            <option>CA: Basic</option>
          </select>

          <label>Pre-tax pension (%)</label>
          <input type="number" defaultValue={5} />

          <div className="thc-inline">
            <span className="thc-chip">Net monthly: —</span>
            <span className="thc-chip">Eff. tax: —</span>
          </div>
        </div>

        {/* Location B */}
        <div className="thc-col">
          <h2>Location B</h2>

          <label>Country / US state</label>
          <select defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            <option>US — Texas</option>
            <option>US — Florida</option>
            <option>Germany</option>
            <option>Australia — NSW</option>
          </select>

          <label>Gross annual salary</label>
          <input type="number" defaultValue={90000} />

          <label>Filing / Plan</label>
          <select defaultValue="US: Single">
            <option>US: Single</option>
            <option>US: Married Filing Jointly</option>
            <option>UK: PAYE</option>
            <option>CA: Basic</option>
          </select>

          <label>Pre-tax pension (%)</label>
          <input type="number" defaultValue={5} />

          <div className="thc-inline">
            <span className="thc-chip">Net monthly: —</span>
            <span className="thc-chip">Eff. tax: —</span>
          </div>
        </div>

        <div className="thc-col thc-actions">
          <button className="thc-btn thc-btn--primary">Calculate & Compare</button>

          <div className="thc-links">
            <Link href="/pro">Advanced (Subscribers)</Link>
            <Link href="/subscribe">Subscribe</Link>
          </div>
        </div>
      </section>

      <footer className="thc-footer">
        <p>
          © {new Date().getFullYear()} TakeHomeCompare.com · v? · —
        </p>
        <p className="thc-disclaimer">
          The calculations and data presented are the most up-to-date available to this site,
          provided strictly as guidance and not financial advice. Do not rely on these figures for
          significant financial decisions without independent verification.
        </p>
      </footer>
    </main>
  );
}
