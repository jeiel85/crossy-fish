import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets work on GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    port: 3000,
    open: false
  }
});
