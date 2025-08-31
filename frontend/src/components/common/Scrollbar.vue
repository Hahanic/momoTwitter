<template>
  <div class="scroll-wrapper h-full w-full">
    <div
      ref="scrollContainer"
      class="scrollbar-container h-full w-full overflow-y-auto"
      :class="[scrollbarClasses, propsClass]"
      :style="{ maxHeight: maxHeight }"
      @scroll="onScroll"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    maxHeight?: string
    visibility?: 'auto' | 'always' | 'hidden'
    propsClass?: string
  }>(),
  {
    visibility: 'auto',
  }
)

const emit = defineEmits(['scroll'])
const onScroll = (event: Event) => {
  emit('scroll', event)
}
const scrollbarClasses = computed(() => {
  switch (props.visibility) {
    case 'hidden':
      return 'custom-scrollbar-hidden'
    case 'always':
      return 'custom-scrollbar-always'
    case 'auto':
    default:
      return 'custom-scrollbar-auto'
  }
})

const scrollContainer = ref<HTMLElement | null>(null)
defineExpose({
  scrollContainer,
})
</script>

<style scoped>
.scroll-wrapper {
  overflow: hidden;
  height: 100%;
}
.custom-scrollbar-always,
.custom-scrollbar-auto {
  padding-right: 5px;
  margin-right: -5px;
  overflow-y: scroll;
}
.custom-scrollbar-always::-webkit-scrollbar,
.custom-scrollbar-auto::-webkit-scrollbar {
  width: 4px;
}

/*  always 滚动条滑块 */
.custom-scrollbar-always::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: #bfbfbf;
}
.dark .custom-scrollbar-always::-webkit-scrollbar-thumb {
  background-color: #333333;
}

/* hidden 强制隐藏滚动条 */
.custom-scrollbar-hidden::-webkit-scrollbar {
  display: none; /* for Chrome, Safari, and Opera */
}
.custom-scrollbar-hidden {
  -ms-overflow-style: none; /* for IE and Edge */
  scrollbar-width: none; /* for Firefox */
}
</style>
