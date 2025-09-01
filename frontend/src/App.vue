<template>
  <MessageProvider>
    <RouterView />
  </MessageProvider>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import MessageProvider from './components/common/MessageProvider.vue'
import useUserStore from './stores/userUserStore.ts'
import useWindowStore from './stores/useWindowStore.ts'

const windowStore = useWindowStore()
const userStore = useUserStore()
const route = useRoute()

// 滚动事件
const handleScroll = () => {
  const scrollTop = window.scrollY

  // Home页
  if (route.path === '/home') {
    // 记忆Home页的滚动位置
    windowStore.setHomeScrollTop(scrollTop)
    // 处理移动端底部菜单的显示/隐藏
    if (windowStore.isMobile) {
      windowStore.handleScrollDirection(scrollTop)
    }
  } else if (['ProfilePosts', 'ProfileReplies', 'ProfileLikes', 'ProfileBookmarks'].includes(route.name as string)) {
    windowStore.setUserProfileScrollTop(scrollTop)
  } else if (route.name === 'PostDetail') {
    windowStore.setPostDetailScroll(route.params.postId as string, scrollTop)
  }
}
// 恢复Home页的滚动位置
watch(
  () => route.path,
  async (routePath) => {
    // 若不在主页帖子流，则移动端底部菜单一直保持显示
    if (routePath !== '/home') {
      windowStore.showNav = true
    }
    await nextTick(() => {
      if (routePath === '/home') {
        window.scrollTo({
          top: windowStore.homeScrollTop,
          behavior: 'auto',
        })
      } else if (
        ['ProfilePosts', 'ProfileReplies', 'ProfileLikes', 'ProfileBookmarks'].includes(route.name as string)
      ) {
        setTimeout(() => {
          window.scrollTo({
            top: windowStore.userProfileScrollTop,
            behavior: 'auto',
          })
        }, 0)
      }
    })
  }
)

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  userStore.checkCurrentUser()
  // 启动认证状态管理
  userStore.initialize()
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style></style>
