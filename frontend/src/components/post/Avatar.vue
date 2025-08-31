<template>
  <div
    class="group relative flex items-center justify-center rounded-full transition-all hover:cursor-pointer"
    :class="containerClass"
  >
    <img
      @click.stop="handleAvatarClick"
      :src="src || '/cat.svg'"
      :alt="alt"
      class="h-full w-full rounded-full object-cover transition-transform duration-300 ease-in-out select-none group-hover:scale-110 group-hover:-rotate-8"
    />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

import { useMessage } from '@/composables/useMessage'

const message = useMessage()
const router = useRouter()

interface Props {
  src?: string
  alt?: string
  username?: string
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  username: '',
  alt: 'Avatar',
  containerClass: '',
  imageClass: '',
})

// 头像点击
const handleAvatarClick = () => {
  if (!props.username) {
    return message.warning('请先登录')
  }
  router.push({
    name: 'Profile',
    params: { username: props.username },
  })
}
</script>

<style scoped></style>
