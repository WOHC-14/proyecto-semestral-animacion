import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// GitHub Pages publica el sitio en https://wohc-14.github.io/proyecto-semestral-animacion/
// por lo que la base debe incluir el nombre del repositorio.
const BASE = '/proyecto-semestral-animacion/';

export default defineConfig({
  base: BASE,
  appType: 'mpa',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        coleccion: resolve(__dirname, 'coleccion.html'),
        servicios: resolve(__dirname, 'servicios.html'),
        sobrenosotros: resolve(__dirname, 'sobrenosotros.html'),
        autoDetalles: resolve(__dirname, 'auto-detalles.html')
      }
    }
  },
  server: {
    port: 5173,
    open: false
  },
  preview: {
    port: 4173,
    open: false
  }
});
