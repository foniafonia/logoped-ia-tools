// CAPTURA de las 8 escenas del tramo 5-10: 1 screenshot por escena + recuento de
// errores de consola. ROBUSTO para la noche: carga el SINGLE-FILE construido vía
// file:// (no depende de un dev server, que el entorno mata). Construye antes:
//   npx vite build --config src/scenes/min05/preview/vite.preview.config.mjs
import { chromium } from 'playwright';
const OUT=process.env.OUT || '/tmp/claude-0/-home-user-logoped-ia-tools/9b311647-96dd-5275-8cdc-1259d5c8ea31/scratchpad/';
const FILE='file:///home/user/logoped-ia-tools/mundo-ladrillos/dist-min05/index.html';
const b=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-background-timer-throttling','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:960,height:560}}); await p.bringToFront();
const errs=[]; p.on('pageerror',e=>errs.push('PE:'+e.message.slice(0,140))); p.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!/EncodingError|decodeAudio/i.test(t))errs.push('C:'+t.slice(0,140));}});
await p.goto(FILE,{waitUntil:'load',timeout:30000});
await p.waitForFunction(()=>window.__READY__&&window.__SCENE_READY__,{timeout:20000});
await p.evaluate(()=>{ const bt=document.getElementById('startBtn'); if(bt) bt.click(); }); // arranca/desbloquea
for (const n of [9,10,11,12,13,14,15,16]){
  await p.evaluate(n=>window.__loadNumero(n), n);
  await p.waitForTimeout(4800); // pasa intro/cámara
  await p.screenshot({ path: `${OUT}cap-${n}.png` });
}
console.log('errores de consola (excl. EncodingError MP3 headless):', errs.length);
for (const e of errs.slice(0,8)) console.log('  '+e);
await b.close();
