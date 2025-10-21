// ------- Rates + utils -------
async function getRates(){
  try {
    const r = await fetch('/api/rates', { cache: 'no-store' });
    if (r.ok) return await r.json();
  } catch(e) {}
  // Fallback to static
  const r2 = await fetch('/rates.json', { cache: 'no-store' });
  return await r2.json();
}

function currency(n, c='USD'){
  try {
    return new Intl.NumberFormat(undefined, { style:'currency', currency:c, maximumFractionDigits:0 }).format(n);
  } catch(e) {
    return Math.round(n).toLocaleString();
  }
}

function computeBrackets(base, brackets){
  let tax = 0;
  for (const b of (brackets||[])){
    const to = (typeof b.to === 'number') ? b.to : Infinity;
    const width = Math.min(Math.max(base - b.from, 0), (to - b.from));
    if (width > 0) tax += width * b.rate;
  }
  return tax;
}

function codeToCurrency(code){
  const eur = ['AUT','BEL','CZE','EST','FIN','FRA','DEU','GRC','IRL','ITA','LVA','LTU','LUX','NLD','PRT','SVK','SVN','ESP','DNK','NOR','SWE','CHE','TUR'];
  if (eur.includes(code)) return 'EUR'; // note: non-euro EUR-like listed get their own codes elsewhere; this is a display simplification for now
  if (code==='GBR') return 'GBP';
  if (code==='CAN') return 'CAD';
  if (code==='MEX') return 'MXN';
  if (code==='JPN') return 'JPY';
  if (code==='CHE') return 'CHF';
  if (code==='NZL') return 'NZD';
  if (code==='SWE') return 'SEK';
  if (code==='NOR') return 'NOK';
  if (code==='DNK') return 'DKK';
  if (code==='ISR') return 'ILS';
  if (code==='TUR') return 'TRY';
  if (code==='KOR') return 'KRW';
  return 'USD';
}

// ------- Locations (ordering logic) -------
// Desired order:
// 1) United States (country)
// 2) US states
// 3) United Kingdom
// 4) European countries (OECD Europe, excluding UK which was already listed)
// 5) The rest of OECD

const OECD_EUROPE = new Set([
  'AUT','BEL','CZE','DNK','EST','FIN','FRA','DEU','GRC','HUN','ISL','IRL','ITA',
  'LVA','LTU','LUX','NLD','NOR','POL','PRT','SVK','SVN','ESP','SWE','CHE','TUR'
]);

async function loadLocations(){
  try {
    const r = await fetch('/data/locations.json', { cache:'no-store' });
    if (r.ok) {
      const raw = await r.json();

      // Flatten raw into two arrays we expect: one for OECD, one for US states (based on previous bundle structure)
      let oecd = [];
      let states = [];
      for (const group of raw){
        if ((group.group || '').toLowerCase().includes('united states') && (group.group || '').toLowerCase().includes('state')){
          states = group.items || [];
        } else {
          // this is likely the "OECD countries" group
          oecd = oecd.concat(group.items || []);
        }
      }

      // Build ordered groups
      const out = [];

      // 1) US first (single item)
      const usa = oecd.find(it => it.code === 'USA');
      if (usa) out.push({ group: 'Featured', items: [usa] });

      // 2) US states
      if (states.length){
        out.push({ group: 'United States — by state', items: states });
      }

      // 3) UK
      const uk = oecd.find(it => it.code === 'GBR');
      if (uk) out.push({ group: 'United Kingdom', items: [uk] });

      // 4) European countries (OECD) excluding USA/GBR
      const europeItems = oecd
        .filter(it => OECD_EUROPE.has(it.code) && it.code !== 'GBR' && it.code !== 'USA')
        .sort((a,b) => a.label.localeCompare(b.label));
      if (europeItems.length){
        out.push({ group: 'Europe (OECD)', items: europeItems });
      }

      // 5) Rest of OECD (non-Europe, excluding USA)
      const rest = oecd
        .filter(it => !OECD_EUROPE.has(it.code) && it.code !== 'USA' && it.code !== 'GBR')
        .sort((a,b) => a.label.localeCompare(b.label));
      if (rest.length){
        out.push({ group: 'Other OECD', items: rest });
      }

      return out;
    }
  } catch(e) {}

  // Minimal fallback so the UI is never empty
  return [
    { group: "Featured", items: [{ code:"USA", label:"United States" }]},
    { group: "United States — by state", items: [
      { code:"US-CA", label:"US — California (CA)" },
      { code:"US-NY", label:"US — New York (NY)" },
      { code:"US-TX", label:"US — Texas (TX)" }
    ]},
    { group: "United Kingdom", items: [{ code:"GBR", label:"United Kingdom" }]},
    { group: "Europe (OECD)", items: [{ code:"IRL", label:"Ireland" }, { code:"DEU", label:"Germany" }]},
    { group: "Other OECD", items: [{ code:"CAN", label:"Canada" }, { code:"JPN", label:"Japan" }]}
  ];
}

function buildLocationOptions(sel, locations, defaultCode = 'USA'){
  if (!sel) { console.warn('buildLocationOptions: select element not found'); return; }
  if (!Array.isArray(locations)) { console.warn('buildLocationOptions: locations invalid'); return; }

  sel.innerHTML = '';
  for (const g of locations){
    const og = document.createElement('optgroup');
    og.label = g.group || '';
    for (const item of (g.items || [])){
      const opt = document.createElement('option');
      opt.value = item.code;
      opt.textContent = item.label;
      og.appendChild(opt);
    }
    sel.appendChild(og);
  }

  if (defaultCode){
    const has = [...sel.querySelectorAll('option')].some(o => o.value === defaultCode);
    if (has) sel.value = defaultCode;
  }
}
