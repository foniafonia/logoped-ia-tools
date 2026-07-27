import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Build autónomo del PREVIEW del tramo 15–20 ("El cordón rojo y los shofarot") en
// UN SOLO HTML (todo inline), para jugarlo en cualquier navegador sin servidor.
//   npx vite build --config src/scenes/min15/preview/vite.preview.config.mjs
const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '../../../..'); // mundo-ladrillos/

export default defineConfig({
  root: here,
  base: './',
  resolve: { alias: { '@src': resolve(projectRoot, 'src') } },
  build: {
    target: 'es2020',
    outDir: resolve(projectRoot, 'dist-min15'),
    emptyOutDir: true
  },
  plugins: [viteSingleFile()]
});
