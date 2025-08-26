<template>
  <div v-if="post.media.length > 0" class="w-full">
    <!-- 单张图片 -->
    <div v-if="post.media.length === 1" class="flex justify-start">
      <div class="dark:border-borderDark border-borderWhite relative mr-2 overflow-hidden rounded-2xl border-1">
        <img
          :src="post.media[0].url"
          class="h-auto max-h-[30rem] w-full cursor-pointer object-cover transition-all hover:brightness-95"
          loading="lazy"
          @click.stop="handleImageClick(post.media[0].url, 0)"
          @error="handleImageError"
        />
      </div>
    </div>

    <div v-else class="mr-2 overflow-hidden rounded-2xl">
      <!-- 三张图片布局：左边一张，右边上下两张 -->
      <div v-if="post.media.length === 3" class="flex" :class="windowStore.isMobile ? 'max-h-55' : 'max-h-65'">
        <!-- 左边大图 -->
        <div class="w-1/2 pr-0.5">
          <img
            :src="post.media[0].url"
            class="dark:border-borderDark border-borderWhite transition-color h-full w-full cursor-pointer object-cover hover:brightness-95"
            loading="lazy"
            @click.stop="handleImageClick(post.media[0].url, 0)"
            @error="handleImageError"
          />
        </div>
        <!-- 右边两张小图 -->
        <div class="flex w-1/2 flex-col pl-0.5">
          <div class="h-1/2 pb-0.5">
            <img
              :src="post.media[1].url"
              class="dark:border-borderDark border-borderWhite transition-color h-full w-full cursor-pointer object-cover hover:brightness-95"
              loading="lazy"
              @click.stop="handleImageClick(post.media[1].url, 1)"
              @error="handleImageError"
            />
          </div>
          <div class="h-1/2 pt-0.5">
            <img
              :src="post.media[2].url"
              class="dark:border-borderDark border-borderWhite transition-color h-full w-full cursor-pointer object-cover hover:brightness-95"
              loading="lazy"
              @click.stop="handleImageClick(post.media[2].url, 2)"
              @error="handleImageError"
            />
          </div>
        </div>
      </div>

      <!-- 其他数量的图片使用网格布局 -->
      <div v-else class="grid max-h-80 gap-0.5" :class="getGridClass(post.media.length)">
        <div v-for="(media, index) in post.media.slice(0, 4)" :key="index" class="relative overflow-hidden">
          <img
            :src="media.url"
            class="dark:border-borderDark border-borderWhite transition-color h-full w-full cursor-pointer object-cover hover:brightness-95"
            :class="{
              'aspect-square': post.media.length > 1 && windowStore.isMobile,
              'max-h-40': post.media.length >= 4 && !windowStore.isMobile,
              'max-h-64': post.media.length === 2,
            }"
            loading="lazy"
            @click.stop="handleImageClick(media.url, index)"
            @error="handleImageError"
          />
          <!-- 如果超过4张图片，显示剩余数量 -->
          <div
            v-if="index === 3 && post.media.length > 4"
            class="bg-opacity-50 absolute inset-0 flex cursor-pointer items-center justify-center bg-black text-xl font-bold text-white"
            @click.stop="handleImageClick(media.url, index)"
          >
            +{{ post.media.length - 4 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import { useWindowStore } from '@/stores'
import { type Post } from '@/types'

const windowStore = useWindowStore()

defineProps<{
  post: Post
}>()

// 图片预览相关状态
const showImagePreview = ref(false)
const previewIndex = ref(0)

// 处理图片点击事件 - 打开图片预览
const handleImageClick = (_imageUrl: string, index: number) => {
  previewIndex.value = index
  showImagePreview.value = true
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('图片加载失败:', img.src)
  // 可以设置一个默认的错误图片
  // img.src = '/path/to/default-error-image.png'
}

// 根据图片数量返回对应的网格布局类
const getGridClass = (count: number) => {
  switch (count) {
    case 2:
      return 'grid-cols-2'
    case 4:
    default:
      return 'grid-cols-2 grid-rows-2'
  }
}
</script>
<style scoped></style>
