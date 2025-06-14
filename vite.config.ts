import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// 手动读取.env文件
function getEnvVar(key: string, defaultValue: string) {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const match = envFile.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : defaultValue;
  } catch {
    return defaultValue;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: getEnvVar('VITE_API_PROXY_TARGET', 'http://localhost:8080'),
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    },
  },
}); 