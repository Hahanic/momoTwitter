import { useBreakpoints } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const useWindowStore = defineStore('window', () => {
  // Home的滚动记忆
  let homeScrollTop = ref<number>(0)
  function setHomeScrollTop(position: number) {
    homeScrollTop.value = position
  }

  // 移动端顶部和底部菜单显示状态
  const showNav = ref<boolean>(true)
  let lastScrollTop = ref<number>(0)
  let accumulatedScroll = ref<number>(0) // 累计滚动距离
  const scrollThreshold = 120 // 滚动阈值

  function handleScrollDirection(scrollTop: number) {
    // 计算滚动差值
    const scrollDifference = scrollTop - lastScrollTop.value

    // 累计滚动距离
    accumulatedScroll.value += scrollDifference

    if (accumulatedScroll.value > scrollThreshold) {
      showNav.value = false
      accumulatedScroll.value = 0
    } else if (accumulatedScroll.value < -scrollThreshold) {
      showNav.value = true
      accumulatedScroll.value = 0
    }

    lastScrollTop.value = scrollTop
  }

  // 视口的断点
  const breakpoints = useBreakpoints({
    mobile: 0,
    tablet: 700,
    laptop: 970,
    desktop: 1130,
  })
  const isMobile = breakpoints.smaller('tablet')
  const isLargeScreen = breakpoints.greaterOrEqual('laptop')

  return {
    homeScrollTop,
    setHomeScrollTop,
    showNav,
    handleScrollDirection,
    isMobile,
    isLargeScreen,
  }
})

export default useWindowStore
