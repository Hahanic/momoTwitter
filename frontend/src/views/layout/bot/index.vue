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
          <button @click="router.push('/home')" class="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft :size="20" />
          </button>
          <div class="md:hidden">
            <button @click="toggleList" class="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <List v-if="!isShowList" :size="20" />
              <X v-else :size="20" />
            </button>
          </div>
        </div>
      </div>
      <!-- 聊天消息区域 -->
      <ChatPanel
        :currentConversationId="currentConversationId"
        :isLoadingMessages="isLoadingMessages"
        :messages="processedMessages"
        :isHtmlContent="true"
      />

      <!-- 输入区域 -->
      <MessageInput
        v-model="inputMessage"
        :placeholder="'输入消息...'"
        :disabled="isStreaming"
        :isLoading="isStreaming"
        @send="sendMessage"
      />
    </div>
  </div>

  <aside
    class="dark:border-borderDark border-borderWhite fixed top-0 right-0 z-2 ml-7 h-[100dvh] w-[15rem] flex-col border-1 bg-white md:sticky md:flex lg:w-[15rem] dark:bg-black"
    :class="{
      'transition-transform duration-300 ease-in-out': true,
      'translate-x-0': isShowList || !windowStore.isLaptop,
      'translate-x-full': !isShowList && windowStore.isLaptop,
    }"
  >
    <!-- 背景 -->
    <Scrollbar ref="scrollbarRef" maxHeight="100%">
      <div class="sticky top-0 flex items-center justify-between bg-white pr-2 pl-4 dark:bg-black">
        <button @click="createNewConversation" class="group relative flex items-center space-x-4 py-4">
          <SquarePen :size="24" />
          <p>新建对话</p>
          <div
            class="absolute right-[-1rem] bottom-[-1.8rem] flex scale-0 rounded-sm bg-gray-800 text-white opacity-0 duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 dark:bg-[#e3e3e3] dark:text-gray-800"
          >
            <span class="px-1 py-0.5 text-[0.9rem]">发起新对话</span>
          </div>
        </button>
        <div class="md:hidden">
          <button @click="toggleList" class="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            <List v-if="!isShowList" :size="20" />
            <X v-else :size="20" />
          </button>
        </div>
      </div>
      <div class="px-4 py-2"><p>近期对话</p></div>
      <div class="flex w-full flex-col pb-20">
        <!-- 对话列表 -->
        <div v-for="(value, index) in conversationList" :key="value._id" class="w-full rounded-4xl sm:w-full">
          <div
            class="flex h-full w-full items-center justify-between rounded-4xl hover:bg-gray-100 dark:hover:bg-[#202327]"
            :class="{ 'bg-gray-100 dark:bg-[#202327]': currentConversationId === value._id }"
          >
            <button @click="toggleConversation(index)" class="h-14 min-w-0 flex-1 cursor-pointer pl-4 text-start">
              <p class="truncate">{{ value.title }}</p>
            </button>
            <div class="h-14 flex-shrink-0">
              <button @click="(e) => handleMenu(e, index)" class="ml-2 h-full pr-4">
                <MoreHorizontal :size="20" />
              </button>
            </div>
          </div>
        </div>

        <!-- 对话设置菜单 - 单独渲染 -->
        <template>
          <Teleport to="body">
            <Transition name="menu-fade">
              <div
                v-if="activeMenuIndex !== null"
                ref="settingsRef"
                :style="menuPosition"
                class="fixed z-3 w-48 rounded-lg border-1 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black"
              >
                <button
                  @click="openMenuModal(activeMenuIndex, 'conversationRename')"
                  class="flex w-full items-center px-4 py-2 text-sm text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
                >
                  重命名
                </button>
                <button
                  @click="openMenuModal(activeMenuIndex, 'conversationDelete')"
                  class="flex w-full items-center px-4 py-2 text-sm text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
                >
                  删除
                </button>
              </div>
            </Transition>
          </Teleport>
        </template>
      </div>
    </Scrollbar>
  </aside>

  <!-- 重命名对话模态框 -->
  <ConfirmDialog :show="showRenameModal" @close="closeModal">
    <template #title>重命名对话</template>
    <template #message>
      <div class="mb-4">
        <input
          v-model="renameInputValue"
          type="text"
          placeholder="输入新的对话标题"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:text-white dark:focus:border-blue-400"
        />
      </div>
    </template>
    <template #buttons>
      <button
        @click="closeModal"
        :disabled="isProcessing"
        class="rounded-full px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:hover:bg-gray-800"
      >
        取消
      </button>
      <button
        @click="handleRenameConversation"
        :disabled="!renameInputValue.trim() || isProcessing"
        class="flex items-center space-x-2 rounded-full px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:hover:bg-gray-800"
      >
        <div
          v-if="isProcessing"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        ></div>
        <span>{{ isProcessing ? '处理中...' : '确认' }}</span>
      </button>
    </template>
  </ConfirmDialog>

  <!-- 删除对话模态框 -->
  <ConfirmDialog :show="showDeleteModal" @close="closeModal">
    <template #title>删除对话</template>
    <template #message>
      <p class="mb-6 text-gray-600 dark:text-gray-300">
        确定要删除对话"{{
          selectedConversationIndex !== null ? conversationList[selectedConversationIndex]?.title : ''
        }}"吗？此操作无法撤销。
      </p>
    </template>
    <template #buttons>
      <button
        @click="closeModal"
        :disabled="isProcessing"
        class="rounded-full px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white hover:dark:bg-gray-800"
      >
        取消
      </button>
      <button
        @click="handleDeleteConversation"
        :disabled="isProcessing"
        class="flex items-center space-x-2 rounded-full px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:hover:bg-gray-800"
      >
        <div
          v-if="isProcessing"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        ></div>
        <span>{{ isProcessing ? '删除中...' : '删除' }}</span>
      </button>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import { ArrowLeft, MoreHorizontal, SquarePen, List, X } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import { ref, nextTick, onMounted, onActivated, onDeactivated, onBeforeUnmount, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import {
  createNewChatStream,
  continueConversationStream,
  getAiConversations,
  getAiConversationHistory,
  renameAiConversation,
  deleteAiConversation,
} from '@/api'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Scrollbar from '@/components/common/Scrollbar.vue'
import ChatPanel from '@/components/ui/ChatPanel.vue'
import MessageInput from '@/components/ui/MessageInput.vue'
import { useMessage } from '@/composables/useMessage'
import { useUserStore, useWindowStore } from '@/stores'
import type { AiConversation, AiChatMessage } from '@/types'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json', json)

interface ProcessedMessage extends AiChatMessage {
  htmlContent?: string
}

const md: MarkdownIt = new MarkdownIt({
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class-name="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch (__) {}
    }
    return '<pre class-name="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  },
})

const userStore = useUserStore()
const windowStore = useWindowStore()
const message = useMessage()
const router = useRouter()
const route = useRoute()

const conversationList = ref<AiConversation[]>([])
const currentConversationId = ref<string | null>(null)
const currentMessages = ref<AiChatMessage[]>([])
const isLoadingMessages = ref<boolean>(false)
const isStreaming = ref<boolean>(false)
const streamingMessage = ref<string>('')
const inputMessage = ref('')
const isShowList = ref<boolean>(false)

const processedMessages = computed((): ProcessedMessage[] => {
  return currentMessages.value.map((message) => {
    if (message.role === 'assistant' && message.content) {
      // 使用 markdown-it 将 Markdown 转换为 HTML
      const rawHtml = md.render(message.content)
      // 使用 DOMPurify 清理 HTML，防止 XSS 攻击
      const safeHtml = DOMPurify.sanitize(rawHtml)
      // 返回一个新对象，包含渲染用的 HTML
      return { ...message, content: safeHtml } as ProcessedMessage
    }
    // 其他类型的消息原样返回
    return message as ProcessedMessage
  })
})

const activeMenuIndex = ref<number | null>(null)
const menuPosition = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })

// 模态框状态
const showRenameModal = ref<boolean>(false)
const showDeleteModal = ref<boolean>(false)
const selectedConversationIndex = ref<number | null>(null)
const renameInputValue = ref<string>('')
const isProcessing = ref<boolean>(false)

const settingsRef = ref<HTMLElement | null>(null)
const scrollbarRef = ref<InstanceType<typeof Scrollbar> | null>(null)

// 移动端显示/隐藏对话列表
const toggleList = () => {
  isShowList.value = !isShowList.value
}

// 自动滚动相关
const isNearBottom = ref<boolean>(true)
const scrollThreshold = 80
let scrollTimer: number | null = null

// 检查是否接近底部
const checkIfNearBottom = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  isNearBottom.value = documentHeight - scrollTop - windowHeight <= scrollThreshold
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'instant',
      })
      // 滚动后更新状态
      isNearBottom.value = true
    }, 0)
  })
}

// 节流的滚动到底部（用于流式消息）
const throttledScrollToBottom = () => {
  if (scrollTimer) return

  scrollTimer = window.setTimeout(() => {
    if (isNearBottom.value) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      })
    }
    scrollTimer = null
  }, 500)
}

// 发送消息
const sendMessage = async () => {
  if (!userStore.user) return message.info('请先登录')
  if (!inputMessage.value.trim() || isStreaming.value) return

  const userMessage = inputMessage.value.trim()

  // 先添加用户消息到界面
  const userMsg: AiChatMessage = {
    role: 'user',
    content: userMessage,
    createdAt: new Date().toISOString(),
  }
  currentMessages.value.push(userMsg)

  scrollToBottom()

  inputMessage.value = ''
  await nextTick()

  // 开始流式接收
  isStreaming.value = true
  streamingMessage.value = ''

  // 添加一个临时的AI消息用于显示流式内容
  const aiMsg: AiChatMessage = {
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString(),
  }
  currentMessages.value.push(aiMsg)
  const aiMessageIndex = currentMessages.value.length - 1

  // 如果用户在底部，自动滚动
  if (isNearBottom.value) {
    scrollToBottom()
  }

  try {
    // 根据是否有当前对话ID选择不同的API
    if (currentConversationId.value) {
      // 继续现有对话
      await continueConversationStream(
        currentConversationId.value,
        { message: userMessage },
        (data) => {
          const content = data.choices[0].delta.content
          if (content) {
            streamingMessage.value += content
            // 更新AI消息内容
            currentMessages.value[aiMessageIndex].content = streamingMessage.value

            // 使用节流的滚动函数
            throttledScrollToBottom()
          }
        },
        (error) => {
          console.error('AI 聊天错误:', error)
          currentMessages.value.splice(aiMessageIndex, 1)
        },
        () => {
          isStreaming.value = false
          streamingMessage.value = ''
        }
      )
    } else {
      // 创建新对话
      await createNewChatStream(
        { message: userMessage },
        (data) => {
          // 如果是新对话，保存conversationId
          if (data.conversationId && !currentConversationId.value) {
            currentConversationId.value = data.conversationId
            // 更新URL，但不触发reload
            window.history.replaceState({}, '', `/bot/${data.conversationId}`)
            // 创建新的对话对象并添加到列表
            const newConversation: AiConversation = {
              _id: data.conversationId,
              userId: userStore.user?._id || '',
              title: userMessage.substring(0, 20),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            conversationList.value.unshift(newConversation)
          }

          const content = data.choices[0].delta.content
          if (content) {
            streamingMessage.value += content
            // 更新AI消息内容
            currentMessages.value[aiMessageIndex].content = streamingMessage.value

            // 使用节流的滚动函数
            throttledScrollToBottom()
          }
        },
        (error) => {
          console.error('AI 聊天错误:', error)
          // 移除失败的AI消息
          currentMessages.value.splice(aiMessageIndex, 1)
        },
        () => {
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
    const response = await getAiConversationHistory(conversationId)
    currentMessages.value = response.userMessages || []

    // 加载完历史消息后，滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('加载对话历史失败:', error)
    currentMessages.value = []
  } finally {
    isLoadingMessages.value = false
  }
}

// 切换对话
const toggleConversation = async (index: number) => {
  const conversation = conversationList.value[index]
  if (conversation) {
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

// 打开重命名或删除模态框
const openMenuModal = (index: number | null, type: 'conversationRename' | 'conversationDelete') => {
  if (index === null) return
  activeMenuIndex.value = null
  selectedConversationIndex.value = index

  if (type === 'conversationRename') {
    renameInputValue.value = conversationList.value[index].title
    showRenameModal.value = true
  } else if (type === 'conversationDelete') {
    showDeleteModal.value = true
  }
}

// 关闭模态框
const closeModal = () => {
  showRenameModal.value = false
  showDeleteModal.value = false
  selectedConversationIndex.value = null
  renameInputValue.value = ''
  isProcessing.value = false
}

// 处理重命名对话
const handleRenameConversation = async () => {
  if (selectedConversationIndex.value === null || !renameInputValue.value.trim() || isProcessing.value) return

  const conversation = conversationList.value[selectedConversationIndex.value]
  const newTitle = renameInputValue.value.trim()

  if (newTitle === conversation.title) {
    closeModal()
    return
  }

  try {
    isProcessing.value = true
    await renameAiConversation(conversation._id, newTitle)

    // 更新本地状态
    conversationList.value[selectedConversationIndex.value].title = newTitle

    message.success('重命名成功')
    closeModal()
  } catch (error: any) {
    console.error('重命名失败:', error)
    message.error(error.message || '重命名失败')
  } finally {
    isProcessing.value = false
  }
}

// 处理删除对话
const handleDeleteConversation = async () => {
  if (selectedConversationIndex.value === null || isProcessing.value) return

  const conversation = conversationList.value[selectedConversationIndex.value]

  try {
    isProcessing.value = true
    await deleteAiConversation(conversation._id)

    // 更新本地状态
    conversationList.value.splice(selectedConversationIndex.value, 1)

    // 如果删除的是当前对话，重定向到主页
    if (currentConversationId.value === conversation._id) {
      router.push({ name: 'Bot' })
    }

    message.success('删除成功')
    closeModal()
  } catch (error: any) {
    console.error('删除失败:', error)
    message.error(error.message || '删除失败')
  } finally {
    isProcessing.value = false
  }
}

onClickOutside(settingsRef, () => {
  activeMenuIndex.value = null
})

onMounted(async () => {
  try {
    const conversations = await getAiConversations()
    conversationList.value = conversations.conversationList

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

  // 添加滚动事件监听器
  window.addEventListener('scroll', checkIfNearBottom)
  // 初始化滚动位置检查
  checkIfNearBottom()
})

let unwatchId: (() => void) | null = null
onActivated(() => {
  if (scrollbarRef.value?.scrollContainer) {
    scrollbarRef.value.scrollContainer.addEventListener('scroll', handleScroll)
  }
  // 监听路由参数变化
  unwatchId = watch(
    () => route.params.id,
    async (newId) => {
      if (newId && typeof newId === 'string') {
        const conversation = conversationList.value.find((conv) => conv._id === newId)
        if (conversation) {
          currentConversationId.value = newId
          await loadConversationHistory(newId)
        } else {
          // router.replace({ name: 'Bot' })
        }
      } else {
        currentConversationId.value = null
        currentMessages.value = []
      }
    }
  )
})
onDeactivated(() => {
  if (scrollbarRef.value?.scrollContainer) {
    scrollbarRef.value.scrollContainer.removeEventListener('scroll', handleScroll)
  }
  unwatchId && unwatchId()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', checkIfNearBottom)
  if (scrollTimer) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }
})
</script>

<style scoped>
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
