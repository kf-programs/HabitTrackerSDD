import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Mindful Routine Tracker',
        short_name: 'Mindful Routines',
        start_url: '/',
        display: 'standalone',
        background_color: '#f8f6f1',
        theme_color: '#f8f6f1',
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
});
