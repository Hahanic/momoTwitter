import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

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
  // state: 当前主题
  const currentTheme = ref<Theme>(getDefaultTheme())
  // getter: 是否是暗黑模式
  const isDarkTheme = computed(() => currentTheme.value === 'dark')
  // action: 切换主题
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  }
  
  // 使用 watch 监听主题变化，并应用副作用
  watch(currentTheme, (newTheme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, newTheme)
  }, {
    // 立即执行一次，确保在初始化时就应用主题
    immediate: true,
  })

  return {
    currentTheme,
    isDarkTheme,
    toggleTheme,
  }
})

export default useThemeStore