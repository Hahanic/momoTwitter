<template>
  <div
    class="group relative flex items-center justify-center rounded-full transition-all hover:cursor-pointer"
    :class="containerClass"
  >
    <img
      v-if="src && showImage"
      :src="src"
      :alt="alt"
      class="rounded-full transition-transform duration-300 ease-in-out select-none group-hover:scale-110 group-hover:-rotate-8"
      :class="imageClass"
    />
    <Cat
      v-else
      :size="48"
      class="transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:-rotate-8"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import Cat from '../ui/Owl.vue'

import useUserStore from '@/stores/user'

const userStore = useUserStore()

interface Props {
  src?: string
  alt?: string
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

// 是否显示图片
const showImage = computed(() => {
  if (props.requireAuth) {
    return userStore.isAuthenticated
  }
  return true
})
</script>

<style scoped></style>
