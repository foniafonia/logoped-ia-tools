// JUGADOR SINTÉTICO / QA de niño para el tramo 5–10 (ver coordinacion/playtester.md).
// Juega las 8 escenas guiándose por __probe()/__walk()/__interact(). Mide
// completado, tiempo, atascos, alarma (sigilo) y capturas de lo que falla.
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const OUT='/tmp/claude-0/-home-user-logoped-ia-tools/9b311647-96dd-5275-8cdc-1259d5c8ea31/scratchpad/';
const BASE='http://127.0.0.1:5178/src/scenes/min05/preview/index.html';
const b = await chromium.launch({ headless:true, args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-angle=swiftshader','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:900,height:520}, isMobile:true, hasTouch:true });
const errs=[]; p.on('pageerror',e=>errs.push('PE:'+e.message.slice(0,100))); p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,100))});
const probe=()=>p.evaluate(()=>window.__probe());
const walk=(x,z)=>p.evaluate(([x,z])=>window.__walk(x,z,0.9),[x,z]);
const inter=()=>p.evaluate(()=>window.__interact());
const load=(n)=>p.evaluate((n)=>window.__loadNumero(n),n);
await p.goto(`${BASE}?scene=9&shot=1`,{waitUntil:'load',timeout:30000});
await p.waitForFunction(()=>window.__READY__&&window.__SCENE_READY__,{timeout:20000});

const TIMEOUT=28; // s por escena
const log=[];
for (const n of [9,10,11,12,13,14,15,16]) {
  await load(n); await p.waitForTimeout(500);
  const t0=Date.now(); let done=false, maxAlarm=0, catches=0, ePressed=0, stuckTicks=0;
  let last=await probe(); let lastPos=last.pos;
  while ((Date.now()-t0)/1000 < TIMEOUT) {
    const pr=await probe();
    maxAlarm=Math.max(maxAlarm, pr.alarm||0);
    if (pr.done) { done=true; break; }
    // ¿me pillaron? (salto grande de posición hacia atrás)
    if (Math.hypot(pr.pos.x-lastPos.x, pr.pos.z-lastPos.z) > 8) catches++;
    lastPos=pr.pos;
    // ¿acción pendiente? pulso E
    if (pr.prompt && /E\b|pulsa|Pulsa/i.test(pr.prompt)) { inter(); ePressed++; }
    // andar hacia el objetivo
    if (pr.goal) await walk(pr.goal[0], pr.goal[1]);
    // ¿atascado? (posición casi igual y no avanza)
    const moved=Math.hypot(pr.pos.x-last.pos.x, pr.pos.z-last.pos.z);
    stuckTicks = moved < 0.15 ? stuckTicks+1 : 0;
    last=pr;
    await p.waitForTimeout(110);
  }
  const pr=await probe();
  if (!done) await p.screenshot({ path: `${OUT}pt-FAIL-${n}.png` });
  log.push({ escena:n, titulo:pr.titulo, completada:done, seg:Math.round((Date.now()-t0)/100)/10,
    gemas: pr.gems?`${pr.gems.got}/${pr.gems.total}`:'-', maxAlarma:+maxAlarm.toFixed(2), pillado:catches, E:ePressed, atascado: stuckTicks>40 });
}
writeFileSync(`${OUT}pt-min05.json`, JSON.stringify({log,errores:errs},null,2));
for (const r of log) console.log(`E${r.escena} ${r.completada?'✅':'❌'} ${r.seg}s gem:${r.gemas} alarma:${r.maxAlarma} pillado:${r.pillado} E:${r.E}${r.atascado?' ATASCADO':''} · ${r.titulo}`);
console.log('errores consola:', errs.length);
await b.close();
