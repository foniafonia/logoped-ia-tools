// QA jugado de la HUIDA (esc 29–31) del tramo 15–20: conduce los hooks
// (__loadNumero/__walk/__act/__probe) con rAF vivo (Playwright) y comprueba que
// cada escena se COMPLETA. Deja capturas.
//   npx vite --port 5185   (en otra terminal)
//   node src/scenes/min15/preview/qa-huida.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:5185';
const PATH = '/src/scenes/min15/preview/index.html';
const OUT = join(__dirname, 'capturas');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
let errors = 0;
page.on('pageerror', (e) => { errors++; console.log('  [pageerror]', e.message); });
page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('  [console.error]', m.text()); } });

const sleep = (ms) => page.waitForTimeout(ms);
const probe = () => page.evaluate(() => window.__probe());
async function walkTo(x, z) {
  for (let i = 0; i < 120; i++) {
    const done = await page.evaluate(([x, z]) => window.__walk(x, z, 0.5), [x, z]);
    await sleep(16);
    if (done) break;
  }
}

await page.goto(`${BASE}${PATH}?scene=29&shot=1`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__READY__ && window.__SCENE_READY__, { timeout: 20000 });
await sleep(600);

// ---------------- ESCENA 29: esconderse en el monte ----------------
console.log('· Escena 29 — escondidos en el monte');
await page.evaluate(() => window.__loadNumero(29));
await sleep(500);
let p = await probe();
console.log('  mundo:', p.mundo, '| objetivo:', p.objetivo, '| goal:', p.goal);
await walkTo(p.goal[0], p.goal[1]);
await sleep(150);
p = await probe();
console.log('  prompt en la cueva:', p.prompt);
await page.screenshot({ path: join(OUT, 'escena-29-monte.png') });
await page.evaluate(() => window.__act()); // esconderse
await sleep(400);
p = await probe();
console.log('  tras esconderse → status:', p.status);
await page.screenshot({ path: join(OUT, 'escena-29-escondido.png') });
// esperar las 3 noches (elipsis time-based)
for (let i = 0; i < 20; i++) { await sleep(600); p = await probe(); if (p.done) break; }
console.log('  final → status:', p.status, '| done:', p.done);
const ok29 = p.done;

// ---------------- ESCENA 30: cruce del Jordán ----------------
console.log('· Escena 30 — cruce de vuelta del Jordán');
await page.evaluate(() => window.__loadNumero(30));
await sleep(500);
p = await probe();
console.log('  mundo:', p.mundo, '| goal:', p.goal);
// cruzar por etapas para pasar por las piedras
const stepsX = [-13, -9.5, -6, -2.5, 1, 4.5, 8, 11.5, 14.5, 17];
for (const sx of stepsX) { await walkTo(sx, 0); await sleep(80); }
await sleep(300);
await page.screenshot({ path: join(OUT, 'escena-30-cruce.png') });
await walkTo(17, 0);
await sleep(1200);
p = await probe();
console.log('  final → status:', p.status, '| done:', p.done);
const ok30 = (p.status && p.status.includes('orilla')) || p.done;

// ---------------- ESCENA 31: el parte a Josué ----------------
console.log('· Escena 31 — el parte a Josué');
await page.evaluate(() => window.__loadNumero(31));
await sleep(500);
p = await probe();
console.log('  mundo:', p.mundo, '| goal:', p.goal);
await walkTo(p.goal[0] - 1.2, p.goal[1] + 1.2);
await sleep(150);
p = await probe();
console.log('  prompt ante Josué:', p.prompt);
await page.screenshot({ path: join(OUT, 'escena-31-reporte.png') });
await page.evaluate(() => window.__act()); // iniciar diálogo
await sleep(300);
// pasar las 3 frases del diálogo
for (let i = 0; i < 4; i++) { await page.evaluate(() => window.__act()); await sleep(500); }
await sleep(1200);
p = await probe();
console.log('  final → status:', p.status, '| done:', p.done);
await page.screenshot({ path: join(OUT, 'escena-31-fin.png') });
const ok31 = p.done || (p.status && p.status.includes('nuestra'));

// ---------------- ESCENA 32: Josué reúne al ejército (reunir 3 corros) ----------------
console.log('· Escena 32 — Josué reúne al ejército');
await page.evaluate(() => window.__loadNumero(32));
await sleep(500);
p = await probe();
console.log('  mundo:', p.mundo, '| objetivo:', p.objetivo);
const RALLIES = [[-9, -5], [-4, 8], [5, -6]];
for (const [rx, rz] of RALLIES) {
  await walkTo(rx, rz);
  await sleep(150);
  await page.evaluate(() => window.__act()); // dar la orden a ese escuadrón
  await sleep(300);
}
await page.screenshot({ path: join(OUT, 'escena-32-ejercito.png') });
for (let i = 0; i < 12; i++) { await sleep(400); p = await probe(); if (p.done) break; }
console.log('  final → status:', p.status, '| done:', p.done);
await page.screenshot({ path: join(OUT, 'escena-32-formado.png') });
const ok32 = p.done || (p.status && p.status.includes('formado'));

// ---------------- ESCENA 33: preparativos de guerra (3 estaciones) ----------------
console.log('· Escena 33 — preparativos de guerra');
await page.evaluate(() => window.__loadNumero(33));
await sleep(500);
p = await probe();
console.log('  mundo:', p.mundo, '| objetivo:', p.objetivo);
const STATIONS = [[-8, -5], [0, 7], [7, -5]];
for (const [sx, sz] of STATIONS) {
  await walkTo(sx, sz);
  await sleep(150);
  await page.evaluate(() => window.__act()); // preparar esa estación
  await sleep(300);
}
for (let i = 0; i < 8; i++) { await sleep(300); p = await probe(); if (p.done) break; }
console.log('  final → status:', p.status, '| done:', p.done);
await page.screenshot({ path: join(OUT, 'escena-33-preparativos.png') });
const ok33 = p.done || (p.status && p.status.includes('preparado'));

// ---------------- ESCENA 34: taller de shofarot (recoger 3 + entregar) ----------------
console.log('· Escena 34 — taller de shofarot');
await page.evaluate(() => window.__loadNumero(34));
await sleep(500);
p = await probe();
console.log('  mundo:', p.mundo, '| objetivo:', p.objetivo);
const BENCHES = [[-8, -4], [0, 6], [6, -4]];
for (const [bx, bz] of BENCHES) {
  await walkTo(bx, bz);
  await sleep(150);
  await page.evaluate(() => window.__act()); // recoger shofar
  await sleep(300);
}
await walkTo(12, 0); // al Cohen
await sleep(150);
p = await probe();
console.log('  prompt ante el Cohen:', p.prompt);
await page.evaluate(() => window.__act()); // entregar
for (let i = 0; i < 8; i++) { await sleep(300); p = await probe(); if (p.done) break; }
console.log('  final → status:', p.status, '| done:', p.done);
await page.screenshot({ path: join(OUT, 'escena-34-shofarot.png') });
const ok34 = p.done || (p.status && p.status.includes('listos'));

await browser.close();
console.log(`\nRESULTADO: esc29 ${ok29 ? '✅' : '❌'} · esc30 ${ok30 ? '✅' : '❌'} · esc31 ${ok31 ? '✅' : '❌'} · esc32 ${ok32 ? '✅' : '❌'} · esc33 ${ok33 ? '✅' : '❌'} · esc34 ${ok34 ? '✅' : '❌'} · errores consola: ${errors}`);
process.exit(ok29 && ok30 && ok31 && ok32 && ok33 && ok34 && errors === 0 ? 0 : 1);
