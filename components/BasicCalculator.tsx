"use client";

import { useState } from "react";

type Option = { label: string; value: string };

const places: Option[] = [
  { label: "Select…", value: "" },
  { label: "US: California", value: "us-ca" },
  { label: "US: New York", value: "us-ny" },
  { label: "UK: England", value: "uk-eng" },
];

const plans: Option[] = [
  { label: "US: Single", value: "us-single" },
  { label: "US: Married", value: "us-married" },
];

export default function BasicCalculator() {
  // minimal state to make the UI feel alive (not doing real math here)
  const [aSalary, setASalary] = useState(90000);
  const [bSalary, setBSalary] = useState(90000);
  const [aPension, setAPension] = useState(5);
  const [bPension, setBPension] = useState(5);

  return (
    <div className="card">
      <div className="grid-2">
        {/* Location A */}
        <section>
          <h3>Location A</h3>

          <label>Country / US state</label>
          <select defaultValue="">
            {places.map((p) => (
              <option key={p.value} value={p.value} disabled={!p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <label>Gross annual salary</label>
          <input
            type="number"
            value={aSalary}
            onChange={(e) => setASalary(Number(e.target.value || 0))}
          />

          <label>Filing / Plan</label>
          <select defaultValue={plans[0].value}>
            {plans.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <label>Pre-tax pension (%)</label>
          <input
            type="number"
            value={aPension}
            onChange={(e) => setAPension(Number(e.target.value || 0))}
          />

          <div className="kpis">
            <span className="chip">Net monthly: —</span>
            <span className="chip">Eff. tax: —</span>
          </div>
        </section>

        {/* Location B */}
        <section>
          <h3>Location B</h3>

          <label>Country / US state</label>
          <select defaultValue="">
            {places.map((p) => (
              <option key={p.value} value={p.value} disabled={!p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <label>Gross annual salary</label>
          <input
            type="number"
            value={bSalary}
            onChange={(e) => setBSalary(Number(e.target.value || 0))}
          />

          <label>Filing / Plan</label>
          <select defaultValue={plans[0].value}>
            {plans.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <label>Pre-tax pension (%)</label>
          <input
            type="number"
            value={bPension}
            onChange={(e) => setBPension(Number(e.target.value || 0))}
          />

          <div className="kpis">
            <span className="chip">Net monthly: —</span>
            <span className="chip">Eff. tax: —</span>
          </div>
        </section>
      </div>

      <button className="btn" style={{ marginTop: 12 }}>
        Calculate & Compare
      </button>
    </div>
  );
}
