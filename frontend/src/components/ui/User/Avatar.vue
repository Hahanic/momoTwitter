<template>
  <div
    class="relative flex items-center justify-center rounded-full transition-all hover:cursor-pointer"
    :class="containerClass"
  >
    <!-- 边框效果 -->
    <div
      v-if="showHoverBorder"
      class="absolute inset-0 rounded-full border-2 border-transparent transition-all hover:border-blue-500"
    ></div>

    <!-- 头像 -->
    <img v-if="src && showImage" :src="src" :alt="alt" class="rounded-full select-none" :class="imageClass" />

    <!-- 默认头像图标 -->
    <UserCircle2Icon v-else :size="iconSize" class="text-[#71767b]" />
  </div>
</template>

<script lang="ts" setup>
import { UserCircle2Icon } from 'lucide-vue-next'
import { computed } from 'vue'

import useUserStore from '@/stores/user'

const userStore = useUserStore()

interface Props {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  showHoverBorder?: boolean
  containerClass?: string
  imageClass?: string
  requireAuth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Avatar',
  size: 'md',
  showHoverBorder: true,
  containerClass: '',
  imageClass: '',
  requireAuth: false,
})

// 根据尺寸计算图标大小
const iconSize = computed(() => {
  const sizeMap = {
    sm: 32,
    md: 44,
    lg: 56,
  }
  return sizeMap[props.size]
})

// 是否显示图片
const showImage = computed(() => {
  if (props.requireAuth) {
    return userStore.isAuthenticated
  }
  return true
})
</script>

<style scoped></style>
