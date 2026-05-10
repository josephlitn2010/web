import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 關鍵：強制輸出的檔案直接放在根目錄，而不是 dist
    outDir: './', 
    // 確保資源路徑是相對路徑
    assetsDir: 'assets',
    // 避免重複清理
    emptyOutDir: false 
  }
})
