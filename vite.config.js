import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import getBrowserConfig from './browser.config.js';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    open: process.env.NODE_ENV === 'production' ? false : getBrowserConfig(), // Не открывать браузер в продакшене
    host: 'localhost' // Явно указываем хост
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  base: './'
});
