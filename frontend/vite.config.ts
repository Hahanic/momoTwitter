import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'emoji-picker',
        },
      },
    }),
    tailwindcss(),
    visualizer({
      open: true,
      gzipSize: true, // 显示 gzipped 大小
      brotliSize: true, // 显示 brotli 大小
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks(id) {
        //   // 将 vue 全家桶单独打包
        //   if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
        //     return 'vue-vendor'
        //   }
        //   // 其他的 node_modules 依赖
        //   if (id.includes('node_modules')) {
        //     return 'vendor'
        //   }
        // },
      },
    },
  },
})
