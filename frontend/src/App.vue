<template>
  <MessageProvider>
    <Scrollbar
      ref="scrollbarRef"
      class="scrollbar-container"
      maxHeight="100dvh"
      visibility="always"
      @scroll="handleScroll"
    >
      <RouterView />
    </Scrollbar>
  </MessageProvider>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import MessageProvider from './components/common/MessageProvider.vue'
import Scrollbar from './components/common/Scrollbar.vue'
import useUserStore from './stores/userUserStore.ts'
import useWindowStore from './stores/useWindowStore.ts'

const windowStore = useWindowStore()
const userStore = useUserStore()
const route = useRoute()

const scrollbarRef = ref<{ scrollContainer: HTMLElement } | null>(null)
// 滚动事件
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const scrollTop = target.scrollTop

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
        scrollbarRef.value?.scrollContainer.scrollTo({
          top: windowStore.homeScrollTop,
          behavior: 'auto',
        })
      } else if (
        ['ProfilePosts', 'ProfileReplies', 'ProfileLikes', 'ProfileBookmarks'].includes(route.name as string)
      ) {
        setTimeout(() => {
          scrollbarRef.value?.scrollContainer.scrollTo({
            top: windowStore.userProfileScrollTop,
            behavior: 'auto',
          })
        }, 0)
      }
    })
  }
)

onMounted(async () => {
  userStore.checkCurrentUser()
})
</script>

<style></style>
