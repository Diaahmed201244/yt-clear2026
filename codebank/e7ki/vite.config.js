import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: path.resolve(__dirname, 'client'),
<<<<<<< HEAD
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'client/src') } },
  build: { outDir: path.resolve(__dirname, 'dist'), emptyOutDir: true }
=======
  base: './',
  plugins: [react()],
  resolve: { 
    alias: { 
      '@': path.resolve(__dirname, 'client/src') 
    } 
  },
  build: { 
    outDir: path.resolve(__dirname, 'dist'), 
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/index.html')
      },
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) return 'index.css';
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
})
