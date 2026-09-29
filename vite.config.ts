/*
 * 模块描述：介绍页构建与开发服务器配置。
 * 产物强制落在 /intro-assets/*：介绍页与功能页同域（同一台机器的两个进程），
 * 功能页占着 /assets/*，两边都用默认命名会撞前缀，分流核心就无法按路径判定归属。
 * base 取绝对的 '/'：介绍页固定在站点根提供服务，没有区域前缀，无需网关注入 <base>。
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const devServerPort = Number(process.env.LAWVER_INTRO_DEV_PORT || 5174)
// 本地开发把 /api 打到分流核心（默认 8080）；也可以直接指向功能页进程。
const apiProxyTarget = process.env.LAWVER_API_PROXY_TARGET || 'http://127.0.0.1:8080'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'intro-assets/[name]-[hash].js',
        chunkFileNames: 'intro-assets/[name]-[hash].js',
        assetFileNames: 'intro-assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: devServerPort,
    strictPort: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
