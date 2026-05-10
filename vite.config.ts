import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 這行是魔法：它把所有 @/ 開頭的路徑都指向你現在放檔案的地方
      "@": path.resolve(__dirname, "./"),
      // 如果程式碼裡有用到 /components/ 或 /lib/，也通通指向這裡
      "/components": path.resolve(__dirname, "./"),
      "/lib": path.resolve(__dirname, "./"),
      "/pages": path.resolve(__dirname, "./"),
    },
  },
});
