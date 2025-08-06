module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // 关键！使用这个预设，它会自动帮你搞定所有冲突。
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // 你可以在这里覆盖或添加自定义的 ESLint 规则
    // 例如：'no-unused-vars': 'warn' // 将未使用的变量从报错降级为警告
  },
}