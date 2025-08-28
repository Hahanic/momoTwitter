<template>
  <!-- 已选择图片预览区 -->
  <div v-if="images.length" class="mt-2">
    <div class="flex flex-wrap gap-2">
      <div
        v-for="(img, idx) in images"
        :key="idx"
        @dragstart="handleDragStart(idx)"
        @dragover.prevent="handleDragOver(idx)"
        @dragleave="handleDragLeave"
        @drop="handleDrop(idx)"
        @dragend="handleDragEnd"
        :class="{
          'opacity-50': draggedIndex !== null && draggedIndex !== idx,
          'scale-105 border-blue-500 shadow-lg': dragOverIndex === idx && dragOverIndex !== draggedIndex,
        }"
        class="group relative h-25 w-25 cursor-grab overflow-hidden rounded-lg border border-dashed border-gray-400 sm:h-28 sm:w-28 dark:border-gray-600"
      >
        <img :src="img.preview" class="h-full w-full object-cover" @click="openPreview(idx)" />
        <button
          type="button"
          class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
          @click.stop="handleRemove(idx)"
          aria-label="移除图片"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  images: Array<{ file: File; preview: string }>
}>()

const emit = defineEmits<{
  (e: 'remove-image', idx: number): void
  (e: 'reorder-images', payload: { from: number; to: number }): void
}>()

const handleRemove = (idx: number) => {
  emit('remove-image', idx)
}

const openPreview = (idx: number) => {
  // TODO 全局预览组件
  console.log('预览图片 index=', idx)
}

const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// 拖曳开始
const handleDragStart = (idx: number) => {
  draggedIndex.value = idx
}

// 拖曳进入某个可放置区域
const handleDragOver = (idx: number) => {
  dragOverIndex.value = idx
}

// 离开可放置区域
const handleDragLeave = () => {
  dragOverIndex.value = null
}

// 拖曳结束
const handleDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

// 拖曳放下
const handleDrop = (dropIndex: number) => {
  if (draggedIndex.value === null || dragOverIndex.value === null) {
    dragOverIndex.value = null
    return
  }

  emit('reorder-images', { from: draggedIndex.value, to: dropIndex })
}
</script>
