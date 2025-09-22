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
      <Transition name="menu-fade">
        <div
          ref="settingsRef"
          v-if="openSettings && type !== 'card'"
          class="absolute right-0 z-2 rounded-md border-1 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black"
        >
          <div class="flex flex-col" @click.stop="openSettings = false">
            <button
              v-if="username === userStore.user?.username"
              @click="deletePost(postId || '')"
              class="rounded-md px-3 py-2 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
            >
              <span class="text-nowrap text-red-500">删除帖子</span>
            </button>
            <button
              v-if="username !== userStore.user?.username"
              @click="() => message.info('以后会减少推荐相似内容')"
              class="rounded-md px-3 py-2 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
            >
              <span class="text-nowrap">不感兴趣</span>
            </button>
          </div>
        </div>
      </Transition>

      <ConfirmDialog :show="isConfirmOpen" @close="isConfirmOpen = false">
        <template #title>删除帖子</template>
        <template #message
          ><p class="mb-6 text-gray-600 dark:text-gray-400">确定要删除这个帖子吗？此操作无法撤销。</p></template
        >
        <template #buttons>
          <button
            @click="isConfirmOpen = false"
            class="rounded-full px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white hover:dark:bg-gray-800"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            :disabled="isLoading"
            class="flex items-center space-x-2 rounded-full px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:hover:bg-gray-800"
          >
            <div
              v-if="isLoading"
              class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
            {{ isLoading ? '删除中...' : '删除' }}
          </button>
        </template>
      </ConfirmDialog>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { MoreHorizontal } from 'lucide-vue-next'
import { ref } from 'vue'

import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
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
const isConfirmOpen = ref(false)

const handleSettings = (e: MouseEvent) => {
  if (props.type === 'card') return
  e.stopPropagation()
  openSettings.value = !openSettings.value
}

let pendingDeletePostId = ''
const deletePost = (postId: string) => {
  pendingDeletePostId = postId
  isConfirmOpen.value = true
}

const isLoading = ref(false)
const confirmDelete = async () => {
  if (!pendingDeletePostId) return
  isLoading.value = true
  try {
    await postInteractionStore.handleDeletePost(pendingDeletePostId)
    message.success('帖子已删除')
  } catch (error: any) {
    console.error('删除帖子失败:', error.message || error)
    message.error(error.message || '删除帖子失败')
  } finally {
    isLoading.value = false
    isConfirmOpen.value = false
    openSettings.value = false
    pendingDeletePostId = ''
  }
}

onClickOutside(settingsRef, handleSettings)
</script>
