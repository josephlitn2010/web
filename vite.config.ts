import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 改為 public_html，避開根目錄安全性檢查
    outDir: 'public_html', 
    emptyOutDir: true
  }
})
