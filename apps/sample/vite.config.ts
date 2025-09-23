import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                chrome: '38', // Target Chromium 38 for Smart TV compatibility
                ie: '11' // Also target IE11 for maximum compatibility
              },
              useBuiltIns: 'usage',
              corejs: 3,
              modules: false
            }
          ]
        ]
      }
    })
  ],
  build: {
    target: 'es2015', // esbuild target, but Babel will transform to ES5
    rollupOptions: {
      output: {
        manualChunks: undefined,
        format: 'iife', // Use IIFE for compatibility
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      },
    },
    minify: 'terser',
    terserOptions: {
      ecma: 5, // ES5 for old browser compatibility
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    cssCodeSplit: false, // Keep CSS in one file
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
  },
  esbuild: false // Disable esbuild since it doesn't support ES5
});
