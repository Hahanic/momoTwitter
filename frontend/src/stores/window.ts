import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBreakpoints } from '@vueuse/core'

const useWindowStore = defineStore('window', () => {
  // home的滚动
  let homeScrollTop = ref<number>(0)
  function setHomeScrollTop(position: number) {
    homeScrollTop.value = position
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
    isMobile,
    isLargeScreen,
  }
})

export default useWindowStore
