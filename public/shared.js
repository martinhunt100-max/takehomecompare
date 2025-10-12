
async function getRates(){
  try{ const r=await fetch('/api/rates',{cache:'no-store'}); if(r.ok) return await r.json(); }catch(e){}
  const r2=await fetch('/rates.json',{cache:'no-store'}); return await r2.json();
}
function currency(n,c='USD'){ try{ return new Intl.NumberFormat(undefined,{style:'currency',currency:c,maximumFractionDigits:0}).format(n);}catch(e){ return Math.round(n).toLocaleString(); } }
function computeBrackets(base,brackets){ let tax=0; for(const b of brackets){ const to=(typeof b.to==='number')?b.to:Infinity; const width=Math.min(Math.max(base-b.from,0),(to-b.from)); if(width>0) tax+=width*b.rate; } return tax; }
async function loadChartJs(){ if(window.Chart) return; const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'; document.head.appendChild(s); await new Promise(res=>{ s.onload=res; }); }
async function loadLocations(){ const r=await fetch('/data/locations.json',{cache:'no-store'}); return r.json(); }
function buildLocationOptions(sel, locations){
  sel.innerHTML = '';
  for(const g of locations){
    const og = document.createElement('optgroup'); og.label = g.group;
    for(const item of g.items){
      const opt = document.createElement('option');
      opt.value = item.code;
      opt.textContent = item.label;
      og.appendChild(opt);
    }
    sel.appendChild(og);
  }
}
function codeToCurrency(code){
  const eur=['AUT','BEL','CZE','EST','FIN','FRA','DEU','GRC','IRL','ITA','LVA','LTU','LUX','NLD','PRT','SVK','SVN','ESP'];
  if(eur.includes(code)) return 'EUR';
  if(code==='GBR') return 'GBP';
  if(code==='CAN') return 'CAD';
  if(code==='MEX') return 'MXN';
  if(code==='JPN') return 'JPY';
  if(code==='CHE') return 'CHF';
  if(code==='NZL') return 'NZD';
  if(code==='SWE') return 'SEK';
  if(code==='NOR') return 'NOK';
  if(code==='DNK') return 'DKK';
  if(code==='ISR') return 'ILS';
  if(code==='TUR') return 'TRY';
  if(code==='KOR') return 'KRW';
  return 'USD';
}
