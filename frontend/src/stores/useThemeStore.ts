import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

type Theme = 'dark' | 'light'

const THEME_KEY = 'theme'

const getDefaultTheme = (): Theme => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>(getDefaultTheme())
  const isDarkTheme = computed(() => currentTheme.value === 'dark')
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  }
  watch(
    currentTheme,
    (newTheme) => {
      const root = document.documentElement
      if (newTheme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      localStorage.setItem(THEME_KEY, newTheme)

      // 动态加载代码高亮样式
      if (newTheme === 'dark') {
        import('highlight.js/styles/github-dark.css')
      } else {
        import('highlight.js/styles/github.css')
      }
    },
    {
      // 立即执行一次，确保在初始化时就应用主题
      immediate: true,
    }
  )

  return {
    currentTheme,
    isDarkTheme,
    toggleTheme,
  }
})

export default useThemeStore
