import { useBreakpoints } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

const useWindowStore = defineStore('window', () => {
  // Home的滚动记忆
  let homeScrollTop = ref<number>(0)
  function setHomeScrollTop(position: number) {
    homeScrollTop.value = position
  }

  //userProfile的滚动记忆
  const userProfileScrollTop = ref<number>(0)
  function setUserProfileScrollTop(position: number) {
    userProfileScrollTop.value = position
  }

  // 帖子详情页滚动记忆：key 为 postId
  const postDetailScrollMap = ref<Record<string, number>>({})

  function setPostDetailScroll(postId: string, position: number) {
    postDetailScrollMap.value[postId] = position
    // 如果记录超过限制，删除最旧的记录
    const keys = Object.keys(postDetailScrollMap.value)
    if (keys.length > 10) {
      const oldestKey = keys[0]
      delete postDetailScrollMap.value[oldestKey]
    }
  }
  function getPostDetailScroll(postId: string): number {
    return postDetailScrollMap.value[postId] ?? 0
  }
  function clearPostDetailScroll(postId?: string) {
    if (postId) {
      delete postDetailScrollMap.value[postId]
    } else {
      postDetailScrollMap.value = {}
    }
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

  // 是否是通过回退移动的路由，如router.back() // 相关的使用在routers/index.ts
  const isBackNavigation = ref<boolean>(false)
  function setBackNavigation(value: boolean) {
    isBackNavigation.value = value
  }

  // 路由移动的类型
  const navType = ref<'new' | 'back' | 'forward' | 'refresh'>('new')
  function setNavType(value: 'new' | 'back' | 'forward' | 'refresh') {
    navType.value = value
  }

  // 导航栈的记录
  const navigationStack = ref<string[]>([])

  let _navIndex = -1
  function recordDirection(to: RouteLocationNormalized): 'new' | 'back' | 'forward' | 'refresh' {
    const key = to.fullPath
    const existIdx = navigationStack.value.indexOf(key)
    if (existIdx === -1) {
      // 新分支：截断 forward 分支后 push
      navigationStack.value.splice(_navIndex + 1)
      navigationStack.value.push(key)
      _navIndex = navigationStack.value.length - 1
      return 'new'
    }
    if (existIdx < _navIndex) {
      _navIndex = existIdx
      return 'back'
    }
    if (existIdx > _navIndex) {
      _navIndex = existIdx
      return 'forward'
    }
    return 'refresh'
  }

  return {
    homeScrollTop,
    userProfileScrollTop,
    setHomeScrollTop,
    setUserProfileScrollTop,
    postDetailScrollMap,
    setPostDetailScroll,
    getPostDetailScroll,
    clearPostDetailScroll,

    navigationStack,
    isBackNavigation,
    setBackNavigation,
    recordDirection,
    setNavType,
    navType,

    showNav,
    handleScrollDirection,
    isMobile,
    isLargeScreen,
  }
})

export default useWindowStore
