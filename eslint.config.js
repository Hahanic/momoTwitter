import typescriptParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  // 基础 JavaScript/TypeScript 文件
  {
    files: ['**/*.{js,ts,mjs,cjs}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Import 导入顺序规则
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js 内置模块
            'external', // 外部依赖
            'internal', // 内部模块
            'parent', // 父级目录
            'sibling', // 同级目录
            'index', // index 文件
          ],
          'newlines-between': 'always', // 组之间空行
          alphabetize: {
            order: 'asc', // 字母顺序
            caseInsensitive: true,
          },
        },
      ],

      // 在这里添加你的其他自定义规则
      // 例如：
      // 'no-console': 'warn',
      // 'prefer-const': 'error',
    },
  },

  // Vue 文件
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: typescriptParser,
      },
    },
    plugins: {
      vue: vue,
      import: importPlugin,
    },
    rules: {
      // Import 导入顺序规则（Vue文件）
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js 内置模块
            'external', // 外部依赖（如 vue, pinia）
            'internal', // 内部模块
            'parent', // 父级目录
            'sibling', // 同级目录
            'index', // index 文件
          ],
          'newlines-between': 'always', // 组之间空行
          alphabetize: {
            order: 'asc', // 字母顺序
            caseInsensitive: true,
          },
        },
      ],

      // 在这里添加你的 Vue 自定义规则
      // 例如：
      // 'vue/no-unused-vars': 'warn',
    },
  },

  // 忽略文件
  {
    ignores: ['node_modules/**', 'frontend/dist/**', 'build/**', 'frontend/stats.html'],
  },
]
