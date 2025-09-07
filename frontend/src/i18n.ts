import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import ja from './locales/ja.json'
import zhCN from './locales/zh-CN.json'

const savedLocale = localStorage.getItem('locale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    en: en,
    'zh-CN': zhCN,
    ja: ja,
  },
})

export default i18n
