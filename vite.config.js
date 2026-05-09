import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward all /api requests to the Express backend in development
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Exclude all backend-only packages from the browser bundle
    rollupOptions: {
      external: [
        'express', 'knex', 'pg', 'dotenv', 'bcrypt', 'jsonwebtoken',
        'pino', 'pino-http', 'helmet', 'cors', 'cookie-parser',
        'express-rate-limit', 'joi', 'uuid',
      ],
    },
  },
  // Prevent Vite from resolving Node.js built-ins
  optimizeDeps: {
    exclude: ['knex', 'pg', 'bcrypt'],
  },
});
