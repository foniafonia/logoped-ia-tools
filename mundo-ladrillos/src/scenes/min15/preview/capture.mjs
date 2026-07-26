// Capturas headless (SwiftShader) de las escenas del tramo 15–20.
// Requiere el dev server de vite en marcha (por defecto puerto 5185):
//   npx vite --port 5185
// Uso:  node src/scenes/min15/preview/capture.mjs [baseUrl]
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
const NUMS = [27, 28];
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
  await page.waitForTimeout(2600);
  const file = join(OUT, `escena-${String(n).padStart(2, '0')}.png`);
  await page.screenshot({ path: file });
  console.log('✓', file);
}

await browser.close();
console.log(`Listo: ${OUT}  (errores de consola: ${errors})`);
process.exit(errors > 0 ? 2 : 0);
