<template>
  <div
    :class="{ 'dark:border-borderDark border-borderWhite border-x-1': !windowStore.isMobile }"
    class="w-full sm:w-[38rem] lg:w-[48rem]"
  >
    <div class="flex min-h-screen w-full flex-col">
      <!-- 顶部区域 -->
      <div
        class="dark:border-borderDark border-borderWhite sticky top-0 z-2 h-12 w-full border-b-1 bg-white dark:bg-black"
      >
        <div class="flex h-full w-full items-center justify-between px-2">
          <button @click="router.back()" class="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft :size="20" />
          </button>
        </div>
      </div>
      <!-- 聊天消息区域 -->
      <div class="w-full flex-1 px-2 pt-8 pb-24 sm:px-4">
        <div v-if="currentConversationId" class="w-full space-y-4">
          <!-- 加载状态 -->
          <div v-if="isLoadingMessages" class="flex justify-center py-4">
            <div class="text-gray-500">加载消息中...</div>
          </div>

          <!-- 消息列表 -->
          <template v-else>
            <div v-for="(message, index) in currentMessages" :key="index">
              <!-- 用户消息 -->
              <div v-if="message.role === 'user'" class="flex flex-col items-end space-y-2">
                <div class="flex items-end space-x-2">
                  <span class="block text-xs text-gray-500">{{ formatTime(message.createdAt) }}</span>
                  <div class="flex h-8 w-8 items-center justify-center rounded-full">
                    <Avatar :username="userStore.user?.username" :src="userStore.user?.avatarUrl" alt="User Avatar" />
                  </div>
                </div>
                <div class="flex">
                  <div class="rounded-lg px-4 py-3 shadow-sm dark:bg-[#202327]/70">
                    <p>{{ message.content }}</p>
                  </div>
                </div>
              </div>

              <!-- AI 消息 -->
              <div v-else-if="message.role === 'assistant'" class="flex flex-col items-start space-y-2">
                <div class="flex items-end space-x-2">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full">
                    <img class="h-full w-full" src="/warp.svg" />
                  </div>
                  <span class="block text-xs text-gray-500">{{ formatTime(message.createdAt) }}</span>
                </div>
                <div class="flex-1">
                  <div class="rounded-lg bg-white px-4 py-3 shadow-sm dark:bg-gray-800/50">
                    <p class="text-gray-800 dark:text-gray-200">{{ message.content }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空消息状态 -->
            <div
              v-if="currentMessages.length === 0"
              class="flex h-full w-full flex-col items-center justify-center space-y-4"
            >
              <img class="h-24 w-24" src="/warp.svg" />
              <p class="text-gray-500">这个对话还没有消息，开始聊天吧！</p>
            </div>
          </template>
        </div>

        <!-- 未选择对话状态 -->
        <div v-else class="flex h-full w-full flex-col items-center justify-center space-y-4">
          <img class="h-24 w-24" src="/warp.svg" />
          <p class="text-gray-500">选择一个对话开始聊天，或创建一个新的对话。</p>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="sticky bottom-0 w-full">
        <Transition name="slide-fade">
          <div v-show="isShowTextarea" class="w-full px-4 pb-1">
            <div class="flex w-full">
              <div
                class="border-borderWhite dark:border-borderDark flex-1 rounded-2xl border-1 bg-white shadow-sm dark:bg-black"
              >
                <div class="relative flex pt-3">
                  <textarea
                    ref="textareaRef"
                    v-model="inputMessage"
                    @input="adjustHeight"
                    placeholder="输入消息..."
                    rows="1"
                    class="w-full resize-none px-4 text-gray-900 placeholder-gray-500 outline-none dark:text-gray-100"
                    style="min-height: 40px; max-height: 250px"
                  ></textarea>
                </div>
                <div class="flex w-full justify-between px-3 py-2">
                  <div class="flex items-center space-x-1">
                    <!-- 隐藏 -->
                    <div class="flex text-gray-400 hover:text-gray-600 dark:hover:text-white">
                      <button @click="isShowTextarea = false" class="p-1">
                        <ChevronsRight :size="20" />
                      </button>
                    </div>
                    <!-- 文件 -->
                    <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    @click="sendMessage"
                    :disabled="!inputMessage.trim() || isStreaming"
                    class="flex items-center space-x-2 rounded-lg bg-blue-500 px-2 py-1 font-medium text-white transition-colors duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-4 sm:py-2 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-500"
                  >
                    <div
                      v-if="isStreaming"
                      class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    ></div>
                    <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span>{{ isStreaming ? '发送中...' : '发送' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
        <div v-show="!isShowTextarea" class="relative flex w-full justify-end">
          <div class="absolute bottom-0 flex p-4 text-gray-500 hover:text-gray-600 dark:hover:text-white">
            <button @click="isShowTextarea = true" class="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
              <ChevronsLeft :size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <aside
    class="dark:border-borderDark border-borderWhite sticky top-0 ml-7 hidden h-[100dvh] w-[15rem] flex-col border-1 transition-all md:flex lg:w-[15rem]"
  >
    <Scrollbar ref="scrollbarRef" maxHeight="100%">
      <div class="sticky top-0 bg-white px-4 dark:bg-black">
        <button @click="createNewConversation" class="group relative flex items-center space-x-4 py-4">
          <SquarePen :size="24" />
          <p>新建对话</p>
          <div
            class="absolute right-[-1rem] bottom-[-1.8rem] flex scale-0 rounded-sm bg-gray-800 text-white opacity-0 duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 dark:bg-[#e3e3e3] dark:text-gray-800"
          >
            <span class="px-1 py-0.5 text-[0.9rem]">发起新对话</span>
          </div>
        </button>
      </div>
      <div class="px-4 py-2"><p>近期对话</p></div>
      <div class="flex w-full flex-col">
        <!-- 对话列表 -->
        <div v-for="(value, index) in conversationList" :key="value._id" class="w-full rounded-4xl sm:w-full">
          <div
            class="flex h-full w-full items-center justify-between rounded-4xl hover:bg-gray-100 dark:hover:bg-[#202327]"
            :class="{ 'bg-gray-100 dark:bg-[#202327]': currentConversationId === value._id }"
          >
            <button @click="toggleConversation(index)" class="h-14 min-w-0 flex-1 cursor-pointer pl-4 text-start">
              <p class="truncate">{{ value.title }}</p>
            </button>
            <div class="relative h-14 flex-shrink-0">
              <button @click="(e) => handleMenu(e, index)" class="ml-2 h-full pr-4">
                <MoreHorizontal :size="20" />
              </button>
            </div>
          </div>
        </div>

        <!-- 对话设置菜单 - 单独渲染 -->
        <Transition name="menu-fade">
          <div
            v-if="activeMenuIndex !== null"
            ref="settingsRef"
            :style="menuPosition"
            class="fixed z-50 w-48 rounded-lg border-1 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black"
          >
            <button
              @click="() => console.log('重命名')"
              class="flex w-full items-center px-4 py-2 text-sm text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
            >
              重命名
            </button>
            <button
              @click="() => console.log('删除')"
              class="flex w-full items-center px-4 py-2 text-sm transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
            >
              删除
            </button>
          </div>
        </Transition>
      </div>
    </Scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ArrowLeft, ChevronsRight, ChevronsLeft, MoreHorizontal, SquarePen } from 'lucide-vue-next'
import { ref, nextTick, onMounted, onActivated, onDeactivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import {
  createNewChatStream,
  continueConversationStream,
  getConversations,
  getConversationHistory,
  type Conversation,
  type ChatMessage,
} from '@/api'
import Scrollbar from '@/components/common/Scrollbar.vue'
import Avatar from '@/components/post/Avatar.vue'
import { useUserStore, useWindowStore } from '@/stores'

const userStore = useUserStore()
const windowStore = useWindowStore()
const router = useRouter()
const route = useRoute()

const conversationList = ref<Conversation[]>([])
const currentConversationId = ref<string | null>(null)
const currentMessages = ref<ChatMessage[]>([])
const isLoadingMessages = ref<boolean>(false)
const isStreaming = ref<boolean>(false)
const streamingMessage = ref<string>('')
const inputMessage = ref('')

const activeMenuIndex = ref<number | null>(null)
const menuPosition = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })

const textareaRef = ref<HTMLTextAreaElement>()
const settingsRef = ref<HTMLElement | null>(null)
const scrollbarRef = ref<InstanceType<typeof Scrollbar> | null>(null)

const isShowTextarea = ref<boolean>(true)

// 调整文本区域高度
const adjustHeight = async () => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isStreaming.value) return

  const userMessage = inputMessage.value.trim()

  // 先添加用户消息到界面
  const userMsg: ChatMessage = {
    role: 'user',
    content: userMessage,
    createdAt: new Date().toISOString(),
  }
  currentMessages.value.push(userMsg)

  // 清空输入框
  inputMessage.value = ''
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  // 开始流式接收
  isStreaming.value = true
  streamingMessage.value = ''

  // 添加一个临时的AI消息用于显示流式内容
  const aiMsg: ChatMessage = {
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString(),
  }
  currentMessages.value.push(aiMsg)
  const aiMessageIndex = currentMessages.value.length - 1

  try {
    // 根据是否有当前对话ID选择不同的API
    if (currentConversationId.value) {
      // 继续现有对话
      await continueConversationStream(
        currentConversationId.value,
        { message: userMessage },
        (data) => {
          console.log('AI 响应数据:', data)
          const content = data.choices[0].delta.content
          if (content) {
            streamingMessage.value += content
            // 更新AI消息内容
            currentMessages.value[aiMessageIndex].content = streamingMessage.value
          }
        },
        (error) => {
          console.error('AI 聊天错误:', error)
          // 移除失败的AI消息
          currentMessages.value.splice(aiMessageIndex, 1)
        },
        () => {
          console.log('AI 回复完成')
          isStreaming.value = false
          streamingMessage.value = ''
        }
      )
    } else {
      // 创建新对话
      await createNewChatStream(
        { message: userMessage },
        (data) => {
          console.log('AI 响应数据:', data)

          // 如果是新对话，保存conversationId并刷新对话列表
          if (data.conversationId && !currentConversationId.value) {
            currentConversationId.value = data.conversationId
            // 更新URL，但不触发reload
            window.history.replaceState({}, '', `/bot/${data.conversationId}`)
            // 刷新对话列表以包含新创建的对话
            refreshConversationList()
          }

          const content = data.choices[0].delta.content
          if (content) {
            streamingMessage.value += content
            // 更新AI消息内容
            currentMessages.value[aiMessageIndex].content = streamingMessage.value
          }
        },
        (error) => {
          console.error('AI 聊天错误:', error)
          // 移除失败的AI消息
          currentMessages.value.splice(aiMessageIndex, 1)
        },
        () => {
          console.log('AI 回复完成')
          isStreaming.value = false
          streamingMessage.value = ''
        }
      )
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    // 移除失败的AI消息
    currentMessages.value.splice(aiMessageIndex, 1)
    isStreaming.value = false
    streamingMessage.value = ''
  }
}

// 加载对话历史消息
const loadConversationHistory = async (conversationId: string) => {
  try {
    isLoadingMessages.value = true
    const response = await getConversationHistory(conversationId)
    currentMessages.value = response.message || []
    console.log('加载对话历史:', response)
  } catch (error) {
    console.error('加载对话历史失败:', error)
    currentMessages.value = []
  } finally {
    isLoadingMessages.value = false
  }
}

// 刷新对话列表
const refreshConversationList = async () => {
  try {
    const conversations = await getConversations()
    conversationList.value = conversations.message.conversationList
  } catch (error) {
    console.error('刷新对话列表失败:', error)
  }
}

// 切换对话
const toggleConversation = async (index: number) => {
  const conversation = conversationList.value[index]
  if (conversation) {
    console.log('切换对话:', conversation)
    // 直接通过路由更新，让 watch 处理加载逻辑
    router.push({ name: 'Bot', params: { id: conversation._id } })
    // 关闭菜单
    activeMenuIndex.value = null
  }
}

// 创建新对话
const createNewConversation = () => {
  console.log('创建新对话')
  // 清空当前对话和消息
  currentConversationId.value = null
  currentMessages.value = []
  // 跳转到新对话页面
  router.push({ name: 'Bot' })
}

// 打开对话菜单
const handleMenu = (e: MouseEvent, index: number) => {
  e.stopPropagation()

  activeMenuIndex.value = index

  // 计算菜单位置
  const buttonRect = (e.target as HTMLElement).getBoundingClientRect()

  menuPosition.value = {
    top: `${buttonRect.bottom}px`,
    left: `${buttonRect.right - 192}px`,
  }
}

// 监听滚动事件，滚动时关闭菜单
const handleScroll = () => {
  if (activeMenuIndex.value !== null) {
    activeMenuIndex.value = null
  }
}

onClickOutside(settingsRef, () => {
  activeMenuIndex.value = null
})

onMounted(async () => {
  try {
    const conversations = await getConversations()
    conversationList.value = conversations.message.conversationList

    const conversationId = route.params.id as string
    if (conversationId && conversationList.value.some((conv) => conv._id === conversationId)) {
      currentConversationId.value = conversationId
      await loadConversationHistory(conversationId)
    } else if (conversationId) {
      router.replace({ name: 'Bot' })
    }
  } catch (error) {
    console.error('获取对话列表失败:', error)
  }
})

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && typeof newId === 'string') {
      const conversation = conversationList.value.find((conv) => conv._id === newId)
      if (conversation) {
        currentConversationId.value = newId
        await loadConversationHistory(newId)
      } else {
        router.replace({ name: 'Bot' })
      }
    } else {
      currentConversationId.value = null
      currentMessages.value = []
    }
  }
)
onActivated(() => {
  if (scrollbarRef.value?.scrollContainer) {
    scrollbarRef.value.scrollContainer.addEventListener('scroll', handleScroll)
  }
})
onDeactivated(() => {
  if (scrollbarRef.value?.scrollContainer) {
    scrollbarRef.value.scrollContainer.removeEventListener('scroll', handleScroll)
  }
})

// 格式化时间
const formatTime = (timestamp?: string) => {
  if (!timestamp) return '刚刚'

  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 大于24小时，显示具体时间
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* 深色模式下的滚动条 */
.dark textarea::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.5);
}

.dark textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.8);
}

/* Firefox 滚动条样式 */
textarea {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.dark textarea {
  scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
}

/* 输入框过渡效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(100%);
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateY(0);
}

/* 菜单动画效果 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.2s ease-out;
}
.menu-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
.menu-fade-enter-to,
.menu-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
