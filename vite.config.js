import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://54.234.192.129:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});