import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/backend/**'],
    },
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/index.css',
        './src/pages/Home.jsx',
        './src/admin/components/AdminLayout.jsx',
        './src/admin/context/AdminDataContext.jsx',
      ],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            // Ignore expected stream resets from SSE/realtime when backend restarts
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
              return;
            }
            console.error('[vite proxy error]', err.message);
          });
        },
      },
      '/uploads': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
              return;
            }
            console.error('[vite proxy error]', err.message);
          });
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'lightgallery',
      'lightgallery/react',
      'react-helmet-async',
      'react-icons',
      'swiper',
      'swiper/react',
      'react-countup',
      '@studio-freight/lenis',
    ],
    holdUntilCrawlEnd: false,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('react-helmet') || id.includes('/react/') || id.includes('\\react\\')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('gsap') || id.includes('@studio-freight')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'vendor-icons';
            }
            if (id.includes('lightgallery')) {
              return 'vendor-lightgallery';
            }
            if (id.includes('swiper')) {
              return 'vendor-swiper';
            }
          }
        },
      },
    },
  },
})
