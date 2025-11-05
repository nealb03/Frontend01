import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// -------------------------------------------------------
// VITE CONFIGURATION FOR allcloudsvcs.com (HTTPS ENABLED)
// -------------------------------------------------------

// ✅ Use HTTPS now that ALB port 443 + ACM certificate are live
const PROD_API_URL = 'https://allcloudsvcs.com';

// -------------------------------------------------------
// Vite configuration
// -------------------------------------------------------
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    base: './',

    plugins: [react()],

    // -----------------------------------
    // Local development server / proxy
    // -----------------------------------
    server: isDev
      ? {
          host: '0.0.0.0',
          port: 5173,
          strictPort: true,
          open: true,
          proxy: {
            // Forward API requests to local backend or ALB endpoint
            '/api': {
              target: 'http://127.0.0.1:80', // local backend while developing
              changeOrigin: true,
              secure: false, // disable SSL check for local http
              logLevel: 'error',
              configure: (proxy) => {
                proxy.on('error', (err, req, res) => {
                  console.error('Proxy error:', err);
                  if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                  }
                  res.end('Proxy error.');
                });
              },
            },
          },
        }
      : undefined,

    // -----------------------------------
    // Production build
    // -----------------------------------
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },

    // -----------------------------------
    // Global definitions (used in app code)
    // -----------------------------------
    define: {
      __API_BASE_URL__: JSON.stringify(isDev ? '' : PROD_API_URL),
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    },

    // -----------------------------------
    // Module resolution aliases
    // -----------------------------------
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});