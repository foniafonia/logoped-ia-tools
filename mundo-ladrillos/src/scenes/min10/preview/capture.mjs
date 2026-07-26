// Capturas headless (SwiftShader) de las 9 escenas del tramo 10–15.
// Requiere el dev server de vite en marcha (por defecto puerto 5180):
//   npx vite --port 5180
// Uso:  node src/scenes/min10/preview/capture.mjs [baseUrl]
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:5180';
const PATH = '/src/scenes/min10/preview/index.html';
const NUMS = [17, 18, 19, 20, 21, 22, 23, 24, 25];
const OUT = join(__dirname, 'capturas');

const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
let errors = 0;
page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('  [page error]', m.text()); } });
page.on('pageerror', (e) => { errors++; console.log('  [pageerror]', e.message); });

mkdirSync(OUT, { recursive: true });

for (const n of NUMS) {
  const url = `${BASE}${PATH}?scene=${n}&shot=1`;
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__READY__ === true && window.__SCENE_READY__ === true, { timeout: 20000 });
  // en las escenas de escondite, colocar al jugador dentro del escondite del tapiz
  if (n === 23 || n === 24 || n === 25) await page.evaluate(() => window.__setPlayer && window.__setPlayer(-8.5, -7.5));
  // esperar a que la intro cinemática (si la hay, ~2.8s) termine y se estabilice
  await page.waitForTimeout(3600);
  const file = join(OUT, `escena-${String(n).padStart(2, '0')}.png`);
  await page.screenshot({ path: file });
  console.log('✓', file);
}

await browser.close();
console.log(`Listo: ${OUT}  (errores de consola: ${errors})`);
process.exit(errors > 0 ? 2 : 0);
