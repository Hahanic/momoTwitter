<template>
  <!-- 已选择图片预览区 -->
  <div v-if="images.length" class="mt-2 px-4 sm:pl-[3.8rem]">
    <div class="flex flex-wrap gap-2">
      <div
        v-for="(img, idx) in images"
        :key="idx"
        class="group relative h-28 w-28 overflow-hidden rounded-lg border border-dashed border-gray-400 dark:border-gray-600"
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
defineProps<{
  images: Array<{ file: File; preview: string }>
}>()

const emit = defineEmits<{
  (e: 'remove-image', idx: number): void
}>()

const handleRemove = (idx: number) => {
  emit('remove-image', idx)
}

const openPreview = (idx: number) => {
  // 预留：可引入全局预览组件
  console.log('预览图片 index=', idx)
}
</script>
