<template>
  <div class="sticky top-0 ml-7 hidden h-[100dvh] w-[15rem] transition-all md:block lg:w-[25rem]">
    <div ref="innerContentRef" :style="innerContentStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core'
import { ref, computed, type StyleValue, watch } from 'vue'

import { useWindowStore } from '@/stores'

const topMargin = 0
const bottomMargin = 20

const windowStore = useWindowStore()
const innerContentRef = ref<HTMLElement | null>(null)

const { height: viewportHeight } = useWindowSize()
const { height: contentHeight } = useElementSize(innerContentRef)

const innerContentStyle = computed((): StyleValue => {
  const availableViewportHeight = viewportHeight.value - topMargin - bottomMargin

  if (contentHeight.value <= availableViewportHeight) {
    return {
      position: 'relative',
      top: `${topMargin}px`,
    }
  }

  return {
    position: 'relative',
    top: `${topMargin}px`,
    transform: `translateY(${translateY.value}px)`,
  }
})

const translateY = ref(0)

watch(
  () => windowStore.scrollY,
  () => {
    if (!innerContentRef.value) return

    const maxScrollable = contentHeight.value - (viewportHeight.value - topMargin - bottomMargin)

    if (maxScrollable <= 0) {
      translateY.value = 0
      return
    }

    if (windowStore.scrollDelta > 0) {
      translateY.value = Math.max(translateY.value - windowStore.scrollDelta, -maxScrollable)
    } else if (windowStore.scrollDelta < 0) {
      translateY.value = Math.min(translateY.value - windowStore.scrollDelta, 0)
    }
  },
  { immediate: true }
)
</script>

<style scoped></style>
