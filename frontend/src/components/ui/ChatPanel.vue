<template>
  <!-- 聊天消息区域 -->
  <div class="w-full flex-1 px-2 pt-8 pb-4 sm:px-4">
    <div v-if="currentConversationId" class="w-full space-y-4">
      <!-- 加载状态 -->
      <div v-if="isLoadingMessages" class="flex justify-center py-8">
        <div class="flex flex-col items-center space-y-3">
          <div class="relative">
            <div class="h-12 w-12 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg class="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                />
              </svg>
            </div>
          </div>
          <div class="text-sm text-gray-500">加载消息中...</div>
        </div>
      </div>

      <!-- 消息列表 -->
      <template v-else>
        <MessageItem
          v-for="msg in normalizedMessages"
          :key="msg.id + msg.timestamp"
          :is-sender="msg.isSender"
          :content="msg.content"
          :timestamp="msg.timestamp"
          :avatar-url="msg.avatarUrl"
          :display-name="msg.displayName"
          :username="msg.username"
          :is-html-content="isHtmlContent"
        >
        </MessageItem>
      </template>
    </div>

    <!-- 未选择对话状态 -->
    <div v-else class="flex h-full w-full flex-col items-center justify-center space-y-4">
      <img class="h-24 w-24" src="/warp.svg" />
      <p class="text-gray-500">选择一个对话开始聊天，或创建一个新的对话。</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import MessageItem from './MessageItem.vue'

import { useUserStore } from '@/stores'
import type { ChatMessage, AiChatMessage } from '@/types'
import { formatTime } from '@/utils'

// 类型保护函数，区分 ChatMessage 和 AiChatMessage
function isAiChatMessage(msg: ChatMessage | AiChatMessage): msg is AiChatMessage {
  return 'role' in msg
}

const props = defineProps<{
  currentConversationId: string | null
  messages: Array<ChatMessage | AiChatMessage> | null
  isLoadingMessages: boolean
  isHtmlContent?: boolean
}>()

const userStore = useUserStore()

const normalizedMessages = computed(() => {
  if (!props.messages) return []

  return props.messages.map((msg) => {
    // 基础信息
    const baseInfo = {
      content: msg.content,
      timestamp: formatTime(msg.createdAt),
    }

    // 根据对话类型判断发送者信息
    if (isAiChatMessage(msg)) {
      const isSender = msg.role === 'user'
      return {
        ...baseInfo,
        id: msg.createdAt,
        isSender,
        displayName: isSender ? userStore.user?.displayName : 'Warp AI',
        username: isSender ? userStore.user?.username : 'warp_ai',
        avatarUrl: isSender ? userStore.user?.avatarUrl : '/warp.svg',
      }
    } else {
      const isSender = msg.senderId._id === userStore.user?._id
      return {
        ...baseInfo,
        id: msg._id,
        isSender,
        displayName: isSender ? userStore.user?.displayName : msg.senderId.displayName,
        username: isSender ? userStore.user?.username : msg.senderId.username,
        avatarUrl: isSender ? userStore.user?.avatarUrl : msg.senderId.avatarUrl,
      }
    }
  })
})
</script>
