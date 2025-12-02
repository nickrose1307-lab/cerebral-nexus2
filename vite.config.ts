import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
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
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
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
            }
          ]
        }
      })
    ],
    base: './', 
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    // This physically replaces 'process.env.VITE_API_KEY' with the actual key string during build
    // We add a fallback to "OFFLINE_MODE" to prevent build/init crashes if the secret is missing
    define: {
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY || "OFFLINE_MODE")
    }
  };
});
