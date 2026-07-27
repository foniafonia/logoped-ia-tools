import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Build autónomo del PREVIEW del tramo 5–10 en UN SOLO HTML (todo inline),
// para poder jugarlo en cualquier navegador sin servidor.
//   npx vite build --config src/scenes/min05/preview/vite.preview.config.mjs
const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '../../../..'); // mundo-ladrillos/

export default defineConfig({
  root: here,
  base: './',
  resolve: { alias: { '@src': resolve(projectRoot, 'src') } },
  build: {
    target: 'es2020',
    outDir: resolve(projectRoot, 'dist-min05'),
    emptyOutDir: true
  },
  plugins: [viteSingleFile()]
});
