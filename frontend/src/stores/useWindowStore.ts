import { useBreakpoints } from '@vueuse/core'
import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

const useWindowStore = defineStore('window', () => {
  const scrollY = ref(0)
  // 滚动差值
  const scrollDelta = ref(0)
  // 上一次的滚动位置
  let lastScrollTop = 0
  // 防止重复添加监听器
  let isScrollListenerInitialized = false

  const homeScrollTop = ref<number>(0)
  const userProfileScrollTop = ref<number>(0)
  const postDetailScrollMap = ref<Record<string, number>>({})
  const exploreScrollMap = ref<Record<string, number>>({})

  // 底部菜单显示状态
  const showNav = ref<boolean>(true)
  // 累计滚动距离
  let accumulatedScroll = 0
  // 滚动阈值
  const scrollThreshold = 120

  // 监听内部调用
  function _handleScroll(currentRoute: RouteLocationNormalized) {
    const currentScrollY = window.scrollY

    // a. 更新基础滚动状态
    scrollDelta.value = currentScrollY - lastScrollTop
    scrollY.value = currentScrollY

    // b. 处理底部菜单的显示/隐藏
    accumulatedScroll += scrollDelta.value
    if (accumulatedScroll > scrollThreshold) {
      showNav.value = false
      accumulatedScroll = 0
    } else if (accumulatedScroll < -scrollThreshold) {
      showNav.value = true
      accumulatedScroll = 0
    }

    // c. 更新当前页面的滚动位置记忆
    const routeName = currentRoute.name as string
    const routePath = currentRoute.path
    if (routePath === '/home') {
      homeScrollTop.value = currentScrollY
    } else if (['ProfilePosts', 'ProfileReplies', 'ProfileLikes', 'ProfileBookmarks'].includes(routeName)) {
      userProfileScrollTop.value = currentScrollY
    } else if (routeName === 'PostDetail') {
      setPostDetailScroll(currentRoute.params.postId as string, currentScrollY)
    } else if (
      ['ExploreForYou', 'ExploreTrending', 'ExploreNews', 'ExploreSports', 'ExploreEntertainment'].includes(routeName)
    ) {
      exploreScrollMap.value[routeName] = currentScrollY
    }

    // d. 更新 lastScrollTop
    lastScrollTop = currentScrollY
  }

  // 初始化滚动监听器
  function initializeScrollListener(currentRoute: RouteLocationNormalized): (() => void) | null {
    if (isScrollListenerInitialized) return null
    // 我们需要 currentRoute 来做滚动位置记忆，所以从 App.vue 传入
    const scrollHandler = () => _handleScroll(currentRoute)
    window.addEventListener('scroll', scrollHandler, { passive: true })
    isScrollListenerInitialized = true

    // 返回一个清理函数，方便 App.vue 在 onUnmounted 中调用
    return () => {
      window.removeEventListener('scroll', scrollHandler)
      isScrollListenerInitialized = false
    }
  }

  // 帖子详情页滚动记忆：key 为 postId
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
    scrollY: readonly(scrollY),
    scrollDelta: readonly(scrollDelta),

    initializeScrollListener,

    homeScrollTop,
    userProfileScrollTop,
    postDetailScrollMap,
    getPostDetailScroll,
    exploreScrollMap,

    navigationStack,
    isBackNavigation,
    setBackNavigation,
    recordDirection,
    setNavType,
    navType,

    showNav,
    isMobile,
    isLargeScreen,
  }
})

export default useWindowStore
