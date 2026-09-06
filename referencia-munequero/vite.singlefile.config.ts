// Empaqueta TODO (motor, texturas, código) en UN html que se abre con doble clic.
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  base: './', plugins: [viteSingleFile()],
  build: { target: 'es2020', outDir: 'dist-suelto', rollupOptions: { input: 'ejemplo/minimo.html' } }
});
