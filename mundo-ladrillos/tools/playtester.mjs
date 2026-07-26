// JUGADOR SINTÉTICO / QA de niño — arnés reutilizable (ver coordinacion/playtester.md).
//
// Juega el tramo 0-5 guiándose por los hooks del juego __probe() (a dónde ir) y
// __walk(x,z,step) (andar), mide tiempos por tarea, cuenta estrellas, registra
// errores de consola y captura pantallazos. La OPINIÓN "de niño" la redacta luego
// un humano/agente con visión a partir de estas pruebas.
//
// Uso:  node tools/playtester.mjs            (sirve dist en localhost:4319 aparte)
//   PORT=4319 OUT=./playtest-out node tools/playtester.mjs
// Requiere: build previo (vite build) + `vite preview --port $PORT`, y Playwright.
import pw from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
const { chromium } = pw;
const PORT = process.env.PORT || 4319;
const OUT = (process.env.OUT || './playtest-out').replace(/\/?$/, '/');
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swapchain', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 900, height: 520 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const shot = (n) => p.screenshot({ path: OUT + 'pt_' + n + '.png' });
const probe = () => p.evaluate(() => window.__probe());
const walk = (x, z, s) => p.evaluate(([x, z, s]) => window.__walk(x, z, s), [x, z, s]);
const jump = (t, fb) => p.evaluate(([t, fb]) => window.__director.start(t, fb), [t, fb]);
const cam = (y, pi, d) => p.evaluate(([y, pi, d]) => { const t = window.__tpcam; t.yaw = y; t.pitch = pi; t.dist = d; }, [y, pi, d]);

await p.goto('http://localhost:' + PORT + '/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__READY__ === true, { timeout: 15000 });
await p.click('#startBtn').catch(() => {});
await p.waitForTimeout(700);
jump(46, 1); await p.waitForTimeout(600); cam(0, 0.42, 16); await shot('00_inicio');

const tasks = [
  { key: 'yeh',    jump: [46, 1],  label: 'Saludar a Yehoshúa',              timeout: 25 },
  { key: 'camp',   jump: [56, 3],  label: 'Recoger cuerdas + arrear ovejas', timeout: 85 },
  { key: 'tab',    jump: [124, 4], label: 'Atrapar el pan del horno',        timeout: 55 },
  { key: 'bultos', jump: [134, 5], label: 'Cargar el camello',              timeout: 70 },
  { key: 'carav',  jump: [229, 6], label: 'Seguir la caravana',             timeout: 30 },
];
const STEP = 8 * 0.12;
const log = [];
for (const task of tasks) {
  jump(task.jump[0], task.jump[1]); await p.waitForTimeout(300);
  const st = await probe(); const t0 = Date.now(); await shot(task.key + '_start');
  let done = false, ticks = 0, aShots = 0;
  while ((Date.now() - t0) / 1000 < task.timeout) {
    const pr = await probe();
    if (pr.done.includes(task.key)) { done = true; break; }
    let goal = pr.goal; if (!goal && task.key === 'yeh') goal = [0, 8];
    if (goal) await walk(goal[0], goal[1], STEP);
    if (ticks % 18 === 9 && aShots < 2) { await shot(task.key + '_play' + aShots); aShots++; }
    ticks++; await p.waitForTimeout(120);
  }
  const pr = await probe(); await shot(task.key + '_end');
  log.push({ task: task.key, label: task.label, completada: done, segundos: Math.round((Date.now() - t0) / 100) / 10,
    estrellas: pr.stars, contadores: { pan: pr.pan, ovejas: pr.sheep, bultos: pr.bultos }, faseVista: st.fase });
}
await p.waitForTimeout(1500); await shot('99_final');
const fin = await probe();
writeFileSync(OUT + 'pt_log.json', JSON.stringify({ log, estrellasFinal: fin.stars, errores: errs }, null, 2));
console.log(JSON.stringify({ log, estrellasFinal: fin.stars, errores: errs.length }, null, 2));
await b.close();
