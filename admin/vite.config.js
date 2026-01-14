import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false, // 如果端口被占用，自動嘗試下一個
    open: true,
    host: '0.0.0.0' // 允許外部訪問
  }
})
