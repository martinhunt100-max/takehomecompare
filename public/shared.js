
async function getRates(){
  try{ const r=await fetch('/api/rates',{cache:'no-store'}); if(r.ok) return await r.json(); }catch(e){}
  const r2=await fetch('/rates.json',{cache:'no-store'}); return await r2.json();
}
function currency(n,c='USD'){ try{ return new Intl.NumberFormat(undefined,{style:'currency',currency:c,maximumFractionDigits:0}).format(n);}catch(e){ return Math.round(n).toLocaleString(); } }
function computeBrackets(base,brackets){ let tax=0; for(const b of brackets){ const to=(typeof b.to==='number')?b.to:Infinity; const width=Math.min(Math.max(base-b.from,0),(to-b.from)); if(width>0) tax+=width*b.rate; } return tax; }
async function loadChartJs(){ if(window.Chart) return; const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'; document.head.appendChild(s); await new Promise(res=>{ s.onload=res; }); }
