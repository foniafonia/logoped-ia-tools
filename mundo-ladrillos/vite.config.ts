import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  base: './',
  server: { host: '127.0.0.1', port: 5178 },
  build: { target: 'es2020', outDir: mode === 'single' ? 'dist-single' : 'dist' },
  plugins: mode === 'single' ? [viteSingleFile()] : []
}));
