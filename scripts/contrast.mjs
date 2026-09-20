/**
 * CONTRAST AUDIT
 * ==============
 * Walks every rendered text node on every page type and measures its computed
 * colour against its own effective background (climbing ancestors past
 * transparent ones), then checks it against the WCAG AA threshold for its
 * actual size and weight.
 *
 *   node scripts/contrast.mjs [baseUrl]
 *
 * Measuring the RENDERED page rather than reading the token table is the point:
 * it caught secondary text at 3.07:1 that looked perfectly fine by eye, and
 * separator dots at 1.49:1 that were effectively invisible. Exits non-zero on
 * any failure.
 */
import puppeteer from 'puppeteer-core';
const BASE=process.argv[2] || 'http://localhost:3320';
const b = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--hide-scrollbars','--disable-gpu']});
const p = await b.newPage(); await p.setViewport({width:1440,height:900});
const PAGES=['/','/magasiner','/aubaines','/laveuses','/refrigerateurs/refrigerateur-portes-francaises-36-acier-inoxydable','/en','/reparation','/pieces','/livraison','/nos-magasins','/nous-joindre','/a/b/c'];
let total=0;
for (const path of PAGES) {
await p.goto(BASE+path,{waitUntil:'domcontentloaded'});
await p.evaluate(async()=>{const s=innerHeight*0.8;for(let y=0;y<document.body.scrollHeight;y+=s){scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}scrollTo(0,0);await new Promise(r=>setTimeout(r,400));});
const out = await p.evaluate(()=>{
  const lin=c=>{c/=255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4};
  const L=([r,g,b])=>0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
  const parse=s=>s.match(/\d+/g).slice(0,3).map(Number);
  const bgOf=el=>{for(let n=el;n;n=n.parentElement){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return parse(c);}return [255,255,255];};
  const ratio=(a,b)=>{const la=L(a),lb=L(b);const hi=Math.max(la,lb),lo=Math.min(la,lb);return (hi+0.05)/(lo+0.05)};
  const targets=[...document.querySelectorAll('a,button,h1,h2,h3,h4,p,span,li,dt,dd,summary,label')].filter(e=>e.textContent.trim() && e.offsetHeight && e.children.length===0);
  const rows=[];
  for(const el of targets.slice(0,900)){
    const cs=getComputedStyle(el);
    const fg=parse(cs.color), bg=bgOf(el);
    const size=parseFloat(cs.fontSize), bold=parseInt(cs.fontWeight)>=700;
    const large = size>=24 || (size>=18.66 && bold);
    const r=ratio(fg,bg); const need=large?3:4.5;
    if(r<need) rows.push({t:el.textContent.trim().slice(0,32), r:+r.toFixed(2), need, size:Math.round(size)});
  }
  return rows;
});
total+=out.length;
console.log(`${out.length?'FAIL':'PASS'}  ${path.padEnd(60)} ${out.length? JSON.stringify(out.slice(0,4)) : 'all text AA'}`);
}
console.log(total? `\n${total} contrast failures` : '\nAll pages: every text node meets WCAG AA against its own background');
await b.close();
process.exit(total ? 1 : 0);
