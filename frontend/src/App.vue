<template>
  <NMessageProvider>
    <n-config-provider :theme="themeStore.isDarkTheme ? darkTheme : lightTheme" class="h-full w-full">
      <n-loading-bar-provider>
        <n-scrollbar
          :class="{ 'hide-scrollbar': windowStore.isMobile }"
          ref="scrollbarRef"
          style="max-height: 100dvh"
          @scroll="handleScroll"
        >
          <RouterView />
        </n-scrollbar>
      </n-loading-bar-provider>
    </n-config-provider>
  </NMessageProvider>
</template>

<script setup lang="ts">
import {
  NConfigProvider,
  NScrollbar,
  NMessageProvider,
  NLoadingBarProvider,
  darkTheme,
  lightTheme,
  type ScrollbarInst,
} from 'naive-ui'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import usethemeStore from './stores/theme.ts'
import useUserStore from './stores/user.ts'
import useWindowStore from './stores/window.ts'

const themeStore = usethemeStore()
const windowStore = useWindowStore()
const userStore = useUserStore()
const route = useRoute()

const scrollbarRef = ref<ScrollbarInst | null>(null)
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
  }
}
// 恢复Home页的滚动位置
watch(
  () => route.path,
  (routePath) => {
    // 若不在主页帖子流，则移动端底部菜单一直保持显示
    if (routePath !== '/home') {
      windowStore.showNav = true
    }
    nextTick(() => {
      if (routePath === '/home') {
        scrollbarRef.value?.scrollTo({
          top: windowStore.homeScrollTop,
          behavior: 'auto',
        })
      } else {
        // scrollbarRef.value?.scrollTo({
        //   top: 0,
        //   behavior: 'auto',
        // })
      }
    })
  },
  { immediate: true }
)

onMounted(async () => {
  userStore.checkCurrentUser()
})
</script>

<style></style>
