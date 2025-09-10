<template>
  <div class="h-full w-full sm:flex sm:justify-center sm:pt-3">
    <div :class="{ 'h-full bg-white dark:bg-black': windowStore.isMobile }">
      <div
        class="relative w-full border-0 bg-white sm:min-h-fit sm:w-[38rem] sm:rounded-2xl dark:border-gray-800 dark:bg-black sm:dark:border-1"
      >
        <div
          class="sticky top-0 z-50 h-[3.5rem] w-full border-b border-gray-200 backdrop-blur-sm sm:rounded-t-2xl dark:border-gray-800"
        >
          <slot name="header" />
        </div>

        <div class="w-full rounded-xl px-4">
          <slot :mobileScrollHeight="mobileScrollHeight" name="content" />
        </div>

        <div
          ref="footerHeightRef"
          class="sticky bottom-0 z-50 w-full border-t border-gray-200 backdrop-blur-sm sm:rounded-b-2xl dark:border-gray-800"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

import { useWindowStore } from '@/stores'

const windowStore = useWindowStore()
const footerHeightRef = ref<HTMLElement | null>(null)
const mobileScrollHeight = ref(0)
let stopObserver: (() => void) | null = null

function startObserver() {
  if (stopObserver || !footerHeightRef.value) return
  const { stop } = useResizeObserver(footerHeightRef, (entries) => {
    const entry = entries[0]
    if (entry) {
      mobileScrollHeight.value = entry.contentRect.height
    }
  })
  stopObserver = stop
  // 初始测量
  if (footerHeightRef.value) {
    mobileScrollHeight.value = footerHeightRef.value.getBoundingClientRect().height
  }
}

function stopObserverIfNeeded() {
  if (stopObserver) {
    stopObserver()
    stopObserver = null
  }
  mobileScrollHeight.value = 0
}

watch(
  () => windowStore.isMobile,
  async (isMobile) => {
    if (isMobile) {
      await nextTick()
      startObserver()
    } else {
      stopObserverIfNeeded()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (windowStore.isMobile) startObserver()
})
onBeforeUnmount(() => {
  stopObserverIfNeeded()
})
</script>
