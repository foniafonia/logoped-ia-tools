// QA jugado del tramo 15–20: conduce los hooks (__loadNumero/__walk/__act/__probe)
// con rAF vivo (Playwright) y comprueba que cada escena se COMPLETA. Deja capturas.
//   npx vite --port 5185   (en otra terminal)
//   node src/scenes/min15/preview/qa.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:5185';
const PATH = '/src/scenes/min15/preview/index.html';
const OUT = join(__dirname, 'capturas');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
let errors = 0;
page.on('pageerror', (e) => { errors++; console.log('  [pageerror]', e.message); });
page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('  [console.error]', m.text()); } });

const sleep = (ms) => page.waitForTimeout(ms);
const probe = () => page.evaluate(() => window.__probe());

await page.goto(`${BASE}${PATH}?scene=27&shot=1`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__READY__ && window.__SCENE_READY__, { timeout: 20000 });
await sleep(600);

async function walkTo(x, z) {
  for (let i = 0; i < 80; i++) {
    const done = await page.evaluate(([x, z]) => window.__walk(x, z, 0.5), [x, z]);
    await sleep(16);
    if (done) break;
  }
}

// ---------------- ESCENA 27: cordón rojo ----------------
console.log('· Escena 27 — cordón rojo');
await page.evaluate(() => window.__loadNumero(27));
await sleep(400);
let p = await probe();
await walkTo(p.goal[0], p.goal[1] + 0.4);
await sleep(120);
p = await probe();
console.log('  prompt en la ventana:', p.prompt);
await page.evaluate(() => window.__act());
await sleep(2200);
p = await probe();
console.log('  status:', p.status, '| done:', p.done);
await page.screenshot({ path: join(OUT, 'escena-27.png') });
const ok27 = p.status && p.status.includes('atado');

// ---------------- ESCENA 28: descuelgue ----------------
console.log('· Escena 28 — descuelgue por la muralla');
await page.evaluate(() => window.__loadNumero(28));
await sleep(400);
p = await probe();
await walkTo(p.goal[0], p.goal[1] - 0.3);
await sleep(120);
p = await probe();
console.log('  prompt en el parapeto:', p.prompt);
await page.evaluate(() => window.__act());   // agarrar la cuerda
await sleep(400);
p = await probe();
console.log('  tras agarrar → cine:', p.cine, '| status:', p.status);
await page.screenshot({ path: join(OUT, 'escena-28-agarra.png') });
// descolgarse: pulsar E hasta llegar al suelo (con margen de framerate headless)
for (let i = 0; i < 20; i++) { await page.evaluate(() => window.__act()); await sleep(450); }
p = await probe();
console.log('  status a mitad/final:', p.status, '| progress:', p.progress);
await sleep(600);
await page.screenshot({ path: join(OUT, 'escena-28-baja.png') });
await sleep(1600);
p = await probe();
console.log('  final → status:', p.status, '| done:', p.done);
const ok28 = (p.status && p.status.includes('tierra')) || p.done;

await browser.close();
console.log(`\nRESULTADO: esc27 ${ok27 ? '✅' : '❌'} · esc28 ${ok28 ? '✅' : '❌'} · errores consola: ${errors}`);
process.exit(ok27 && ok28 && errors === 0 ? 0 : 1);
