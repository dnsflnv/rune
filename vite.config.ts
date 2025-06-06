import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { cloudflare } from '@cloudflare/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       'react-vendor': ['react', 'react-dom', 'react-router-dom'],
    //       'map-vendor': ['maplibre-gl']
    //     }
    //   }
    // }
  },
  publicDir: 'public',
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@assets': resolve(__dirname, './src/assets'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@types': resolve(__dirname, './src/types'),
      '@styles': resolve(__dirname, './src/styles'),
      '@config': resolve(__dirname, './src/config'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@services': resolve(__dirname, './src/services'),
    },
  },
  assetsInclude: ['README.md', 'LICENSE.md'],
});
