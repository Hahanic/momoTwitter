<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  NConfigProvider,
  NScrollbar,
  NMessageProvider,
  NLoadingBarProvider,
  darkTheme,
  lightTheme,
  type ScrollbarInst,
} from 'naive-ui'
import usethemeStore from './stores/theme.ts'
import useWindowStore from './stores/window.ts'
import { useRoute } from 'vue-router'

const themeStore = usethemeStore()
const windowStore = useWindowStore()
const route = useRoute()

// 恢复滚动位置
const scrollbarRef = ref<ScrollbarInst | null>(null)
const handleScroll = (e: Event) => {
  if (route.name === 'Home') {
    const target = e.target as HTMLElement
    windowStore.setHomeScrollTop(target.scrollTop)
  }
}
watch(
  () => route.name,
  (routeName) => {
    setTimeout(() => {
      if (routeName === 'Home') {
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
</script>

<template>
  <NMessageProvider>
    <n-config-provider :theme="themeStore.isDarkTheme ? darkTheme : lightTheme">
      <n-loading-bar-provider>
        <n-scrollbar
          ref="scrollbarRef"
          @scroll="handleScroll"
          style="max-height: 100vh"
        >
          <RouterView />
        </n-scrollbar>
      </n-loading-bar-provider>
    </n-config-provider>
  </NMessageProvider>
</template>

<style></style>
