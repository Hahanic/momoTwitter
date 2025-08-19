<template>
  <div
    v-if="visible"
    class="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
    @click="handleClose"
    @keydown.esc="handleClose"
  >
    <div class="relative max-h-[90vh] max-w-[90vw]">
      <!-- 关闭按钮 -->
      <button
        class="absolute -top-10 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white opacity-80 transition-opacity hover:opacity-100"
        @click="handleClose"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- 图片导航按钮 - 左 -->
      <button
        v-if="images.length > 1 && currentIndex > 0"
        class="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800 text-white opacity-80 transition-opacity hover:opacity-100"
        @click.stop="previousImage"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- 图片导航按钮 - 右 -->
      <button
        v-if="images.length > 1 && currentIndex < images.length - 1"
        class="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800 text-white opacity-80 transition-opacity hover:opacity-100"
        @click.stop="nextImage"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- 图片 -->
      <img
        :src="images[currentIndex]"
        :alt="`图片 ${currentIndex + 1}`"
        class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        @click.stop
        @error="handleImageError"
      />

      <!-- 图片计数器 -->
      <div
        v-if="images.length > 1"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-gray-800 px-3 py-1 text-sm text-white opacity-80"
      >
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onUnmounted, ref, watch } from 'vue'

interface Props {
  visible: boolean
  images: string[]
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
})

const emit = defineEmits<{
  close: []
  indexChange: [index: number]
}>()

const currentIndex = ref(props.initialIndex)

// 监听visible变化，重置索引
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      currentIndex.value = props.initialIndex
      nextTick(() => {
        // 聚焦以便键盘导航
        document.addEventListener('keydown', handleKeydown)
      })
    } else {
      document.removeEventListener('keydown', handleKeydown)
    }
  }
)

// 键盘导航
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      handleClose()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// 关闭预览
const handleClose = () => {
  emit('close')
}

// 上一张图片
const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('indexChange', currentIndex.value)
  }
}

// 下一张图片
const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    emit('indexChange', currentIndex.value)
  }
}

// 图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('预览图片加载失败:', img.src)
}

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 防止背景滚动 */
.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
