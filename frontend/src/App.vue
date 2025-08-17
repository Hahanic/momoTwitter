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
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import usethemeStore from './stores/theme.ts'
import useUserStore from './stores/user.ts'
import useWindowStore from './stores/window.ts'

const themeStore = usethemeStore()
const windowStore = useWindowStore()
const userStore = useUserStore()
const route = useRoute()

// 恢复滚动位置
const scrollbarRef = ref<ScrollbarInst | null>(null)
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const scrollTop = target.scrollTop

  if (route.path === '/home') {
    windowStore.setHomeScrollTop(scrollTop)
  }

  // 处理移动端底部菜单的显示/隐藏
  if (windowStore.isMobile) {
    windowStore.handleScrollDirection(scrollTop)
  }
}
watch(
  () => route.path,
  (routePath) => {
    setTimeout(() => {
      if (routePath === '/home') {
        scrollbarRef.value?.scrollTo({
          top: windowStore.homeScrollTop,
          behavior: 'auto',
        })
      } else {
        scrollbarRef.value?.scrollTo({
          top: 0,
          behavior: 'auto',
        })
      }
    }, 0)
  },
  { immediate: true }
)

onMounted(() => {
  userStore.checkCurrentUser()
})
</script>

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

<style></style>
