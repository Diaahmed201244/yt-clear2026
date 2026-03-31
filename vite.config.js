import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { terser } from 'rollup-plugin-terser';
import gzipPlugin from 'rollup-plugin-gzip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        yt: resolve(__dirname, 'yt-new-clear.html'),
        codebank: resolve(__dirname, 'codebank/indexCB.html'),
        e7ki: resolve(__dirname, 'services/e7ki/index.html'),
        farragna: resolve(__dirname, 'services/farragna/index.html'),
        samma3ny: resolve(__dirname, 'services/samma3ny/index.html'),
        pebalaash: resolve(__dirname, 'services/pebalaash/index.html'),
        eb3at: resolve(__dirname, 'services/eb3at/index.html'),
        games: resolve(__dirname, 'services/games/index.html'),
        battalooda: resolve(__dirname, 'battalooda/index.html')
      },
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-3d';
            if (id.includes('matter-js')) return 'vendor-physics';
            if (id.includes('gsap')) return 'vendor-animation';
            if (id.includes('wavesurfer.js')) return 'vendor-audio';
            return 'vendor-core';
          }
          // Your modules
          if (id.includes('/shared/')) return 'shared-core';
          if (id.includes('/acc/')) return 'acc-system';
          if (id.includes('/codebank/')) return 'codebank-core';
        }
      },
      plugins: [
        terser({
          compress: { drop_console: true, drop_debugger: true }
        }),
        gzipPlugin()
      ]
    }
  },
  
  // Development server
  server: {
    port: 3000,
    strictPort: true,
    cors: true
  },
  
  // Optimizations
  optimizeDeps: {
    include: ['wavesurfer.js']
  }
});
