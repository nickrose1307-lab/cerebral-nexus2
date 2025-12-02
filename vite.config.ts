import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Removed local assets (favicon, etc) to prevent build errors since they don't exist in repo
      manifest: {
        name: 'Cerebral Nexus',
        short_name: 'Cerebral',
        description: 'Unlock the potential of your mind through progressive AI-generated challenges.',
        theme_color: '#030712',
        background_color: '#030712',
        display: 'standalone',
        start_url: './',
        scope: './',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2919/2919601.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2919/2919601.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn-icons-png\.flaticon\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'icon-cache',
              expiration: {
                 maxEntries: 10,
                 maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                 statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
