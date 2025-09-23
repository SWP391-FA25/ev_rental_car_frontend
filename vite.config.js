import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components/ui': path.resolve(
        __dirname,
        './src/features/shared/components/ui'
      ),
      '@/components': path.resolve(
        __dirname,
        './src/features/shared/components'
      ),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/lib': path.resolve(__dirname, './src/features/shared/lib'),
      '@/hooks': path.resolve(__dirname, './src/features/shared/hooks'),
      '@/i18n': path.resolve(__dirname, './src/features/shared/i18n'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
