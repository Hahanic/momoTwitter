<template>
  <MessageProvider>
    <RouterView />
  </MessageProvider>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import MessageProvider from './components/common/MessageProvider.vue'
import { useWindowStore, useUserStore, useThemeStore } from './stores'

const windowStore = useWindowStore()
const userStore = useUserStore()
const route = useRoute()

// 初始化主题store
useThemeStore()

// Token刷新检查函数
const checkTokenValidity = () => {
  if (userStore.isAuthenticated) {
    userStore.ensureValidToken()
  }
}

// 页面可见性变化处理函数
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    checkTokenValidity()
  }
}

// 恢复页面的滚动位置
watch(
  () => route.path,
  async (routePath) => {
    // 若不在主页帖子流，则移动端底部菜单一直保持显示
    if (routePath !== '/home') {
      windowStore.showNav = true
    }
    await nextTick(() => {
      // 主页帖子流
      if (routePath === '/home') {
        window.scrollTo({
          top: windowStore.homeScrollTop,
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
      else if (
        [
          'ExploreSearchPosts',
          'ExploreForYou',
          'ExploreTrending',
          'ExploreNews',
          'ExploreSports',
          'ExploreEntertainment',
        ].includes(route.name as string)
      ) {
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
  // 如果用户已登录（从持久化存储中恢复），检查token
  checkTokenValidity()
  // 检查当前用户信息
  await userStore.checkCurrentUser()
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
