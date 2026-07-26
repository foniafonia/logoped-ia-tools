// CAPTURA de las 8 escenas del tramo 5-10: 1 screenshot por escena + recuento de
// errores de consola. Uso nocturno (verificacion 0 errores cada ciclo).
import { chromium } from 'playwright';
const OUT=process.env.OUT || '/tmp/claude-0/-home-user-logoped-ia-tools/9b311647-96dd-5275-8cdc-1259d5c8ea31/scratchpad/';
const BASE='http://127.0.0.1:5178/src/scenes/min05/preview/index.html';
const b=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-background-timer-throttling']});
const p=await b.newPage({viewport:{width:960,height:560}}); await p.bringToFront();
const errs=[]; p.on('pageerror',e=>errs.push('PE:'+e.message.slice(0,120))); p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,120))});
await p.goto(`${BASE}?scene=9&shot=1`,{waitUntil:'load',timeout:30000});
await p.waitForFunction(()=>window.__READY__&&window.__SCENE_READY__,{timeout:20000});
for (const n of [9,10,11,12,13,14,15,16]){
  await p.evaluate(n=>window.__loadNumero(n), n);
  await p.waitForTimeout(4800); // pasa intro
  await p.screenshot({ path: `${OUT}cap-${n}.png` });
}
console.log('errores de consola:', errs.length);
for (const e of errs.slice(0,8)) console.log('  '+e);
await b.close();
