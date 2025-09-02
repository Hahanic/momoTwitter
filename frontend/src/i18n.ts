import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'

const savedLocale = localStorage.getItem('locale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en: en,
    'zh-CN': zhCN,
  },
})

export default i18n
