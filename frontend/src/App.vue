<template>
  <MessageProvider>
    <RouterView />
  </MessageProvider>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import MessageProvider from './components/common/MessageProvider.vue'
import { initSocket } from './socket'
import { useWindowStore, useUserStore, useThemeStore, usePostFeedStore } from './stores'

const windowStore = useWindowStore()
const userStore = useUserStore()
const postFeedStore = usePostFeedStore()
const route = useRoute()

// 初始化主题store
useThemeStore()

// 页面可见性变化处理函数
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    userStore.ensureValidToken()
  }
}

// 恢复页面的滚动位置
watch(
  () => route.path,
  async (routePath) => {
    // 若不在主页帖子流，则移动端底部菜单一直保持显示
    if (routePath !== '/home') {
      windowStore.isShowTopNav = true
    }
    await nextTick(() => {
      // 主页帖子流
      if (routePath === '/home') {
        window.scrollTo({
          top: windowStore.homeScrollTop[postFeedStore.activeFeedType] || 0,
          behavior: 'auto',
        })
      }
      // 用户个人主页
      else if (['ProfilePosts', 'ProfileReplies', 'ProfileLikes', 'ProfileBookmarks'].includes(route.name as string)) {
        window.scrollTo({
          top: windowStore.userProfileScrollTop,
          behavior: 'auto',
        })
      }
      // 探索页
      else if (['ExploreForYou', 'ExploreSearchPosts', 'ExploreSearchUsers'].includes(route.name as string)) {
        window.scrollTo({
          top: windowStore.exploreScrollMap[route.name as string] || 0,
          behavior: 'auto',
        })
      }
      // 404页
      else if (['GlobalNotFound', 'ExploreNotFound'].includes(route.name as string)) {
        window.scrollTo({
          top: 0,
          behavior: 'auto',
        })
      }
    })
  }
)

let cleanupScrollListener: (() => void) | null = null

onMounted(async () => {
  cleanupScrollListener = windowStore.initializeScrollListener(route)

  // 添加页面可见性监听
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // 检查当前用户信息
  // 如果用户已登录（从持久化存储中恢复），检查token
  Promise.all([userStore.checkCurrentUser(), userStore.ensureValidToken()])

  // 初始化Socket连接
  if (userStore.isAuthenticated) {
    initSocket(userStore.getAccessToken() as string)
  }
})

onUnmounted(() => {
  // 清理所有事件监听器
  if (cleanupScrollListener) {
    cleanupScrollListener()
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style></style>
