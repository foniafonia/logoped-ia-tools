import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const EXE = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const BASE = process.env.BASE || 'http://localhost:5173';
const OUT = process.env.OUT || 'previews';
const FIGS = ['espia', 'espia2', 'yehoshua', 'rahab', 'guardia', 'jefeGuardia', 'sacerdote', 'beduino', 'rabino'];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: EXE,
  headless: true,
  args: [
    '--use-gl=angle', '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
    '--no-sandbox'
  ]
});
const page = await browser.newPage({ viewport: { width: 700, height: 820 }, deviceScaleFactor: 2 });
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()); });

for (const fig of FIGS) {
  await page.goto(`${BASE}/preview.html?fig=${fig}`, { waitUntil: 'networkidle' });
  await page.waitForFunction('window.__ready === true', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
  const path = `${OUT}/${fig}.png`;
  await page.screenshot({ path });
  console.log('OK', path);
}

await browser.close();
console.log('DONE');
