import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // 新增這段：告訴 Vite 如果沒寫副檔名，就自動幫我嘗試這些
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      "@": path.resolve(__dirname, "./"),
      "/components": path.resolve(__dirname, "./"),
      "/lib": path.resolve(__dirname, "./"),
      "/pages": path.resolve(__dirname, "./"),
    },
  },
});
