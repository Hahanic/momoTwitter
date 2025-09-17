<template>
  <div class="flex w-full flex-1 items-center justify-between text-[0.9rem]">
    <!-- userName -->

    <div class="flex" :class="type !== 'default' ? 'flex-col' : 'items-start justify-center'">
      <span class="font-semibold hover:underline">{{ userDisplayName }}</span>

      <span v-if="type !== 'default'" class="text-gray-500">@{{ username }}</span>

      <div v-else class="tracking-tighter text-gray-500 sm:tracking-normal">
        <span class="ml-1">@{{ username }}</span>
        <span class="sm:mx-1">·</span>
        <span>{{ formatDate(createdAt || '') }}</span>
      </div>
    </div>

    <!-- setting -->
    <div class="relative">
      <button @click="handleSettings" class="flex items-center justify-center">
        <MoreHorizontal :size="iconSize || 20" :class="iconColor ? iconColor : 'text-gray-500'" />
      </button>

      <div
        ref="settingsRef"
        v-if="openSettings && type !== 'card'"
        class="absolute right-0 z-2 rounded-md border-1 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black"
      >
        <div class="flex flex-col">
          <button
            v-if="username === userStore.user?.username"
            @click.stop="deletePost(postId || '')"
            class="rounded-md px-3 py-2 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
          >
            <span class="text-nowrap text-red-500">删除帖子</span>
          </button>
          <button
            v-if="username !== userStore.user?.username"
            @click.stop="deletePost(postId || '')"
            class="rounded-md px-3 py-2 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
          >
            <span class="text-nowrap">不感兴趣</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { MoreHorizontal } from 'lucide-vue-next'
import { ref } from 'vue'

import { useMessage } from '@/composables/useMessage'
import { usePostInteractionStore, useUserStore } from '@/stores'
import { formatDate } from '@/utils'

const userStore = useUserStore()
const postInteractionStore = usePostInteractionStore()
const message = useMessage()

const props = defineProps<{
  type: 'default' | 'detail' | 'card'
  username: string
  userDisplayName: string
  createdAt?: string
  postId?: string
  iconSize?: number
  iconColor?: string
}>()

const openSettings = ref(false)
const settingsRef = ref<HTMLElement | null>(null)

const handleSettings = (e: MouseEvent) => {
  if (props.type === 'card') return
  e.stopPropagation()
  openSettings.value = !openSettings.value
}

const deletePost = async (postId: string) => {
  try {
    await postInteractionStore.handleDeletePost(postId)
    message.success('帖子已删除')
  } catch (error: any) {
    console.error('删除帖子失败:', error.message || error)
    message.error(error.message || '删除帖子失败')
  } finally {
    openSettings.value = false
  }
}

onClickOutside(settingsRef, handleSettings)
</script>
