// public/js/shared.js
//
// Populates location dropdowns from /api/locations
// Expects (if present in DOM):
//   - #countryA, #stateA
//   - #countryB, #stateB
//
// locations JSON shape expected from /api/locations:
// {
//   "countries": [
//     {
//       "code": "US",
//       "name": "United States",
//       "states": [{ "code": "CA", "name": "California" }, ...]
//     },
//     { "code": "UK", "name": "United Kingdom", "states": [] },
//     ...
//   ]
// }

(function () {
  // --- Utilities -------------------------------------------------------------

  async function fetchJSON(url) {
    const res = await fetch(url, { headers: { "cache-control": "no-store" } });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
  }

  // Robust lookup helpers
  function findCountry(countries, codeOrName) {
    if (!codeOrName) return null;
    const needle = String(codeOrName).toLowerCase();
    return (
      countries.find(
        (c) =>
          String(c.code).toLowerCase() === needle ||
          String(c.name).toLowerCase() === needle
      ) || null
    );
  }

  // DOM helpers
  function clearOptions(selectEl) {
    while (selectEl.options.length) selectEl.remove(0);
  }

  function addOption(selectEl, value, label, selected = false) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    if (selected) opt.selected = true;
    selectEl.appendChild(opt);
  }

  function populateCountries(selectEl, countries, preselectCode) {
    clearOptions(selectEl);
    addOption(selectEl, "", "Select country"); // placeholder
    countries.forEach((c) => {
      addOption(selectEl, c.code, c.name, c.code === preselectCode);
    });
  }

  function populateStates(selectEl, country) {
    clearOptions(selectEl);
    if (!country || !Array.isArray(country.states) || country.states.length === 0) {
      addOption(selectEl, "", "— No states —");
      selectEl.disabled = true;
      return;
    }
    selectEl.disabled = false;
    addOption(selectEl, "", "Select state");
    country.states.forEach((s) => addOption(selectEl, s.code, s.name));
  }

  function wirePair(countrySelect, stateSelect, countries) {
    // Initial states for currently selected country (if any)
    const currentCountry = findCountry(countries, countrySelect.value);
    populateStates(stateSelect, currentCountry);

    // When country changes, rebuild states
    countrySelect.addEventListener("change", () => {
      const chosen = findCountry(countries, countrySelect.value);
      populateStates(stateSelect, chosen);
      // Clear any previous selection
      if (stateSelect.value) stateSelect.value = "";
      // Let calculators listening on change react
      stateSelect.dispatchEvent(new Event("change"));
    });
  }

  // --- Main init ------------------------------------------------------------

  async function initLocationDropdowns() {
    let countries = [];
    try {
      // Primary: server route
      const data = await fetchJSON("/api/locations");
      countries = Array.isArray(data?.countries) ? data.countries : [];
    } catch (e) {
      // Fallback: public file (if present)
      try {
        const dataFile = await fetchJSON("/data/locations.json");
        countries = Array.isArray(dataFile?.countries) ? dataFile.countries : [];
      } catch (e2) {
        console.error("[shared.js] Could not load locations from /api/locations or /data/locations.json");
        countries = [];
      }
    }

    // If nothing loaded, bail quietly
    if (!countries.length) return;

    // Grab elements if they exist
    const countryA = document.getElementById("countryA");
    const stateA = document.getElementById("stateA");
    const countryB = document.getElementById("countryB");
    const stateB = document.getElementById("stateB");

    // Populate pairs defensively
    if (countryA && stateA) {
      populateCountries(countryA, countries, countryA.value || undefined);
      wirePair(countryA, stateA, countries);
    }

    if (countryB && stateB) {
      populateCountries(countryB, countries, countryB.value || undefined);
      wirePair(countryB, stateB, countries);
    }
  }

  // Run automatically when the page is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLocationDropdowns);
  } else {
    initLocationDropdowns();
  }

  // Also expose a manual hook in case your app code wants to re-run it
  window.initLocationDropdowns = initLocationDropdowns;
})();
