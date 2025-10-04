<template>
  <main
    v-show="isLargeScreen || !isChildRouteActive || (!isMobile && !isChildRouteActive)"
    :class="{
      'w-[15rem] lg:w-[25rem]': isLargeScreen,
      'w-[38rem]': !isLargeScreen && !isMobile,
      'dark:border-borderDark border-borderWhite border-x-1': !isMobile,
      'w-[100vw]': isMobile,
    }"
    class="sticky top-0 h-[100dvh] transition-all"
  >
    <div class="flex h-full w-full flex-col">
      <Scrollbar class="flex-1" :visibility="'hidden'" :maxHeight="'100dvh'">
        <div class="sticky top-0 z-10 flex w-full items-center px-2 py-3 dark:bg-black">
          <RouterLink v-if="isMobile" to="/" class="mr-3"><ArrowLeft :size="24" /> </RouterLink>
          <p class="pl-2 text-[1.1rem]">对话列表</p>
        </div>
        <ul v-if="!isLoadingConversations && conversationList.length">
          <li v-for="conversation in conversationList" :key="conversation._id" class="w-full">
            <button
              @click="router.push(`/messages/${conversation._id}`)"
              class="conversation-wrapper flex w-full items-center justify-between p-3 transition-all hover:bg-[#f7f9f9] dark:hover:bg-[#16181c]"
              :class="{
                'active-conversation bg-[#f7f9f9] dark:bg-[#16181c]': conversation._id === currentConversationId,
              }"
            >
              <div class="relative flex w-full items-center">
                <!-- 对应用户的在线状态: 仅私聊且对方在线才显示 -->
                <div
                  v-if="!conversation.isGroup && conversation.peerId && onlineUserIdsSet.has(conversation.peerId)"
                  class="absolute bottom-0 left-10 z-10 h-2 w-2 rounded-full bg-blue-500"
                ></div>
                <!-- 消息未读数 -->
                <span
                  v-if="conversation.unreadCount > 0"
                  class="absolute right-0 bottom-[50%] z-10 translate-y-[50%] rounded-full bg-blue-500/80 px-2 py-1 text-xs text-white"
                >
                  {{ conversation.unreadCount >= 100 ? '99+' : conversation.unreadCount }}
                </span>
                <Avatar
                  class="h-12 w-12 flex-shrink-0"
                  :src="conversation.displayAvatar"
                  :username="conversation.username || conversation.displayName"
                  :event="!conversation.isGroup"
                />
                <div class="flex flex-1 flex-col pl-3 text-left">
                  <div class="flex items-start space-x-2 md:flex-col lg:flex-row">
                    <p class="wrap-anywhere">{{ conversation.displayName }}</p>
                    <span class="text-[0.9rem] text-gray-500">{{ formatDate(conversation.lastMessageAt) }}</span>
                  </div>
                  <p class="mt-1 line-clamp-1 text-sm">
                    {{ conversation.lastMessageSnippet || '暂无消息' }}
                  </p>
                </div>
              </div>
            </button>
          </li>
        </ul>
        <div v-else-if="isLoadingConversations" class="flex h-full w-full justify-center p-3">
          <div class="flex">
            <div class="text-sm text-gray-500">加载对话中...</div>
          </div>
        </div>
        <div class="h-10"></div>
      </Scrollbar>
    </div>
  </main>

  <aside
    v-show="isLargeScreen || isChildRouteActive"
    :class="{
      'w-[39.75rem]': isLargeScreen,
      'w-[38rem]': !isLargeScreen && !isMobile && isChildRouteActive,
      'w-[100vw]': isMobile && isChildRouteActive,
      'dark:border-borderDark border-borderWhite border-r-1': !isMobile,
    }"
  >
    <div class="h-full w-full" v-if="!isChildRouteActive">
      <div class="flex h-full w-full flex-col items-center justify-center text-start">
        <div class="space-y-3">
          <p class="text-3xl font-bold">选择一条私信</p>
          <p class="text-gray-500">从现有对话中选择，开始新的对话，或者只是继续浏览。</p>
          <button class="rounded-3xl bg-blue-400 px-4 py-2 text-[1.2rem] font-bold transition-colors hover:bg-blue-500">
            <span>新私信</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex min-h-screen flex-col" v-else>
      <nav class="sticky top-0 z-10 w-full">
        <div
          class="border-borderWhite dark:border-borderDark flex h-full w-full items-center justify-center border-b-1"
        >
          <div class="flex h-[3.2rem] w-full justify-start bg-white dark:bg-black">
            <div class="flex items-center justify-center">
              <button
                @click="router.back()"
                class="rounded-full p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft :size="24" />
              </button>
              <div class="ml-5 text-xl font-bold">
                <p></p>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <ChatPanel
        :currentConversationId="currentConversationId"
        :messages="currentMessages"
        :isLoadingMessages="isLoadingMessages"
        :isLoadingMoreMessages="isLoadingMoreMessages"
        :hasMoreMessages="hasMore"
        @loadMore="loadMore"
      />
      <!-- 输入区域 -->
      <MessageInput
        v-model="inputMessage"
        :placeholder="'输入消息...'"
        :disabled="isSendingMessage"
        :isLoading="isSendingMessage"
        @send="sendMessage"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onActivated, onDeactivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Scrollbar from '@/components/common/Scrollbar.vue'
import Avatar from '@/components/ui/Avatar.vue'
import ChatPanel from '@/components/ui/ChatPanel.vue'
import MessageInput from '@/components/ui/MessageInput.vue'
import { useChatStore } from '@/stores'
import useWindowStore from '@/stores/useWindowStore'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()
const windowStore = useWindowStore()
const chatStore = useChatStore()

const { isMobile, isLargeScreen } = storeToRefs(windowStore)
const {
  currentConversationId,
  conversationList,
  currentMessages,
  isLoadingConversations,
  isLoadingMessages,
  isSendingMessage,
  isLoadingMoreMessages,
  hasMoreMap,
  onlineUserIds,
} = storeToRefs(chatStore)

const onlineUserIdsSet = computed(() => onlineUserIds.value)

const inputMessage = ref('')

const isChildRouteActive = computed(() => {
  return route.path.startsWith('/messages/') && route.path !== '/messages'
})

const sendMessage = async (message: string) => {
  if (!message.trim() || !currentConversationId.value) return
  await chatStore.handleSendMessage({ content: message.trim() })
  inputMessage.value = ''
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'auto',
  })
}

const hasMore = computed(() => {
  if (!currentConversationId.value) return false
  const v = hasMoreMap.value.get(currentConversationId.value)
  return v !== false // 未定义视为还有更多
})

const loadMore = () => {
  if (currentConversationId.value) {
    chatStore.loadMoreMessages(currentConversationId.value)
  }
}

// 获取对话列表 如果带有 id 则获取消息
onMounted(async () => {
  try {
    await chatStore.fetchConversations()
    const conversationId = route.params.id as string
    if (conversationId && conversationList.value.some((conv) => conv._id === conversationId)) {
      currentConversationId.value = conversationId
      await chatStore.fetchMessages(conversationId)
    } else if (conversationId) {
      router.replace('/messages')
    }
  } catch (error) {
    console.error('获取对话列表失败:', error)
  }
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'auto',
  })
})

let unwatchId: (() => void) | null = null
onActivated(async () => {
  // 监听 route 变化
  unwatchId = watch(
    () => route.params.id,
    async (newVal) => {
      if (newVal) {
        currentConversationId.value = newVal as string | null
        await chatStore.selectConversation(currentConversationId.value)
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'auto',
        })
      } else {
        currentConversationId.value = null
      }
    }
  )
})

onDeactivated(() => {
  unwatchId && unwatchId()
})
</script>

<style scoped>
.conversation-wrapper {
  position: relative;
}
.conversation-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 2px;
  background-color: #1d9bf0;
  border-radius: 9999px;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}
.active-conversation.conversation-wrapper::after {
  transform: scaleY(1);
}
</style>
