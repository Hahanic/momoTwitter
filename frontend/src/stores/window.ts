import { useBreakpoints } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const useWindowStore = defineStore('window', () => {
  // home的滚动
  let homeScrollTop = ref<number>(0)
  function setHomeScrollTop(position: number) {
    homeScrollTop.value = position
  }

  // 移动端底部菜单显示状态
  const showBottomNav = ref<boolean>(true)
  let lastScrollTop = ref<number>(0)
  const scrollThreshold = 5 // 滚动阈值

  function handleScrollDirection(scrollTop: number) {
    const scrollDifference = scrollTop - lastScrollTop.value

    // 向下滚动且超过阈值时隐藏菜单
    if (scrollDifference > scrollThreshold && scrollTop > scrollThreshold) {
      showBottomNav.value = false
    }
    // 向上滚动时显示菜单
    else if (scrollDifference < -10) {
      showBottomNav.value = true
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
    showBottomNav,
    handleScrollDirection,
    isMobile,
    isLargeScreen,
  }
})

export default useWindowStore
