module.exports = {
  extends: ['@commitlint/config-conventional'],

  prompt: {
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围（可选）:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footer: '列举关联issue (可选) 例如: #31, #344 :\n',
      confirmCommit: '是否提交或修改 commit ?',
    },

    types: [
      { value: 'feat', name: '特性:   ✨  新增功能', emoji: ':sparkles:' },
      { value: 'fix', name: '修复:   🐛  修复缺陷', emoji: ':bug:' },
      { value: 'docs', name: '文档:   📝  文档变更', emoji: ':memo:' },
      {
        value: 'style',
        name: '格式:   💄  代码格式（不影响功能）',
        emoji: ':lipstick:',
      },
      {
        value: 'refactor',
        name: '重构:   ♻️  代码重构（不包括 bug 修复、功能新增）',
        emoji: ':recycle:',
      },
      { value: 'perf', name: '性能:   🚀  性能优化', emoji: ':zap:' },
      {
        value: 'test',
        name: '测试:   ✅  添加疏漏测试或已有测试改动',
        emoji: ':white_check_mark:',
      },
      {
        value: 'build',
        name: '构建:   📦️  构建流程、外部依赖变更（如升级 npm 包）',
        emoji: ':package:',
      },
      {
        value: 'ci',
        name: '集成:   ⚙️  修改 CI 配置、脚本',
        emoji: ':ferris_wheel:',
      },
      { value: 'revert', name: '回退:   ⏪️  回滚 commit', emoji: ':rewind:' },
      {
        value: 'chore',
        name: '其他:   🛠️  对构建过程或辅助工具和库的更改',
        emoji: ':hammer:',
      },
    ],

    scopes: ['frontend', 'backend', 'docs', 'ci', 'tooling', 'style'],

    useEmoji: true, // 在 commit message 中是否使用 emoji
    themeColorCode: '38;5;168', // 交互界面的主题色
    allowCustomScopes: true, // 是否允许自定义 scope
    allowBreakingChanges: ['feat', 'fix'], // 哪些类型下允许填写 breaking change
  },
}
