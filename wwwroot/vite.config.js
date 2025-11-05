import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const prodBackend = 'http://ec2-34-192-116-54.compute-1.amazonaws.com:5001';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';

  return {
    base: './', // important for relative asset paths in production build
    plugins: [react()],
    server: isDev
      ? {
          host: true,
          port: 5173,
          proxy: {
            // Proxy /api requests to your local backend during development
            '/api': {
              target: 'http://localhost:5001',
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,

    define: {
      // Define a global constant to use as API base URL in frontend code
      __API_BASE_URL__: JSON.stringify(isDev ? '/api' : prodBackend),
    },
  };
});