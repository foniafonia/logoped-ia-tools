// JUGADOR SINTÉTICO / QA de niño para el tramo 5–10 (ver coordinacion/playtester.md).
// Juega las 8 escenas guiándose por __probe()/__walk()/__interact()/__jump(). Mide
// completado, tiempo, alarma (sigilo) y captura lo que falla (pt-FAIL-N.png).
//
// ⚠️ LECCIÓN CLAVE PARA ARNESES HEADLESS (avisad a todos los hilos):
// Chromium ESTRANGULA los timers de una página en segundo plano (~1 tick/seg),
// aunque pongas --disable-background-timer-throttling. Un bucle de juego con
// setTimeout DENTRO del navegador se ahoga: da ~10 pasos en 18s y TODO parece
// "atascado" aunque el juego esté perfecto (falso negativo). SOLUCIÓN fiable:
// conducir los pasos DESDE NODE (cuyos timers NO se estrangulan) y dar varios
// __walk por tick para ir por delante del bucle rAF del juego. Con esto las
// escenas se completan de verdad.
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const OUT='/tmp/claude-0/-home-user-logoped-ia-tools/9b311647-96dd-5275-8cdc-1259d5c8ea31/scratchpad/';
const BASE='http://127.0.0.1:5178/src/scenes/min05/preview/index.html';
const b = await chromium.launch({ headless:true, args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-angle=swiftshader','--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'] });
const p = await b.newPage({ viewport:{width:900,height:520}, isMobile:true, hasTouch:true });
await p.bringToFront();
const errs=[]; p.on('pageerror',e=>errs.push('PE:'+e.message.slice(0,120))); p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,120))});
await p.goto(`${BASE}?scene=9&shot=1`,{waitUntil:'load',timeout:30000});
await p.waitForFunction(()=>window.__READY__&&window.__SCENE_READY__,{timeout:20000});

// Un "tick" hace, DENTRO del navegador y en un solo salto: leer estado, pulsar E
// si hay acción (o si ya estamos muy cerca), y dar `steps` pasos hacia el objetivo
// (con sidestep breve si el progreso se estanca). Node controla el ritmo.
const tick = (steps) => p.evaluate((steps) => {
  const pr = window.__probe();
  if (pr.done) return pr;
  const nearGoal = (pr.progress || 0) > 0.8;
  if (pr.prompt || nearGoal) window.__interact();
  if (pr.goal) {
    let [gx, gz] = pr.goal;
    // pequeño rodeo determinista si el objetivo apenas se acerca
    if (window.__stuck > 8) { gx += ((window.__stuck % 24 < 12) ? 3 : -3); window.__jump && window.__jump(); }
    for (let s = 0; s < steps; s++) window.__walk(gx, gz, 0.9);
  }
  const prog = pr.progress || 0;
  window.__lp = window.__lp ?? -1;
  window.__stuck = (prog <= window.__lp + 0.002) ? (window.__stuck || 0) + 1 : 0;
  window.__lp = prog;
  return pr;
}, steps);

const log = [];
for (const n of [9, 10, 11, 12, 13, 14, 15, 16]) {
  await p.evaluate((n) => { window.__loadNumero(n); window.__lp = -1; window.__stuck = 0; }, n);
  await p.waitForTimeout(500);
  const t0 = Date.now();
  let done = false, maxAlarm = 0, ePressed = 0;
  for (let i = 0; i < 500 && (Date.now() - t0) < 16000; i++) {
    const pr = await tick(3);
    maxAlarm = Math.max(maxAlarm, pr.alarm || 0);
    if (pr.prompt || (pr.progress || 0) > 0.8) ePressed++;
    if (pr.done) { done = true; break; }
    await p.waitForTimeout(16);
  }
  const pr = await p.evaluate(() => window.__probe());
  if (!done) await p.screenshot({ path: `${OUT}pt-FAIL-${n}.png` });
  log.push({ escena: n, titulo: pr.titulo, tipo: pr.tipo, done, seg: Math.round((Date.now() - t0) / 100) / 10,
    gems: pr.gems ? `${pr.gems.got}/${pr.gems.total}` : '-', maxAlarma: +maxAlarm.toFixed(2),
    E: ePressed, prog: +(pr.progress || 0).toFixed(2), pos: pr.pos });
}
writeFileSync(`${OUT}pt-min05.json`, JSON.stringify({ log, errores: errs }, null, 2));
for (const r of log) console.log(`E${r.escena} ${r.done?'✅':'❌'} ${r.seg}s prog:${r.prog} gem:${r.gems} alarma:${r.maxAlarma} [${r.tipo}] · ${r.titulo}`);
console.log('errores consola:', errs.length, errs.slice(0,6).join(' | '));
await b.close();
