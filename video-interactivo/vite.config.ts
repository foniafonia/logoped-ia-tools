import { defineConfig } from "vite";

// App estatica sin backend. Base relativa para que funcione en Vercel
// y tambien si se sirve desde un subdirectorio.
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: true,
  },
});
