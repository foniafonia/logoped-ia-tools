// Capturas headless (SwiftShader) de las 8 escenas del tramo 5–10.
// Requiere el servidor de vite en marcha:  npm run dev   (puerto 5178)
// Uso:  node src/scenes/min05/preview/capture.mjs [baseUrl]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:5178';
const PATH = '/src/scenes/min05/preview/index.html';
const NUMS = [9, 10, 11, 12, 13, 14, 15, 16];
const OUT = join(__dirname, 'capturas');

const browser = await chromium.launch({
  headless: true,
  args: [
    '--use-gl=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--use-angle=swiftshader',
    '--no-sandbox'
  ]
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.log('  [page error]', m.text()); });
page.on('pageerror', (e) => console.log('  [pageerror]', e.message));

import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

for (const n of NUMS) {
  const url = `${BASE}${PATH}?scene=${n}`;
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  // esperar a que el motor y la escena estén listos
  await page.waitForFunction(() => window.__READY__ === true && window.__SCENE_READY__ === true, { timeout: 20000 });
  // dejar correr unos frames (animaciones, antorchas, conos)
  await page.waitForTimeout(1400);
  const file = join(OUT, `escena-${String(n).padStart(2, '0')}.png`);
  await page.screenshot({ path: file });
  console.log('✓', file);
}

await browser.close();
console.log('Listo:', OUT);
