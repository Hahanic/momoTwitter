import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

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
    // Gzip 压缩
    viteCompression({
      verbose: true, // 是否在控制台输出压缩结果
      disable: false, // 是否禁用
      threshold: 10240, // 文件大小大于 10kb 才进行压缩
      algorithm: 'gzip', // 压缩算法
      ext: '.gz', // 文件扩展名
      deleteOriginFile: false, // 是否删除源文件
    }),

    // Brotli 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
    }),
    tailwindcss(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    host: '127.0.0.1',
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
