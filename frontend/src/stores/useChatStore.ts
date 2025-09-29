import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getMyConversations, getMessages, markAsRead, sendMessage } from '@/api'
import type { Conversation, ChatMessage, SendMessagePayload } from '@/types'

const useChatStore = defineStore('chat', () => {
  // 使用 Map 存储会话列表，key 为 conversation._id，便于快速查找
  const conversationsMap = ref<Map<string, Conversation>>(new Map())

  // 使用 Map 缓存每个会话的消息列表
  const messagesMap = ref<Map<string, ChatMessage[]>>(new Map())

  // 当前激活的会话ID
  const currentConversationId = ref<string | null>(null)

  // 发送消息时的
  const isSendingMessage = ref(false)
  // 加载状态
  const isLoadingConversations = ref(false)
  const isLoadingMessages = ref(false)

  // 将会话 Map 转换为按最新消息排序的数组，供 UI 使用
  const conversationList = computed(() => {
    const list = Array.from(conversationsMap.value.values())
    list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    list.sort((a, b) => {
      // 置顶排序
      if (a.isSticky && !b.isSticky) return -1
      if (!b.isSticky && a.isSticky) return 1
      return 0
    })
    return list
  })

  // 获取当前激活的会话对象
  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null
    return conversationsMap.value.get(currentConversationId.value) || null
  })

  // 获取当前会话的消息列表
  const currentMessages = computed(() => {
    if (!currentConversationId.value) return []
    return messagesMap.value.get(currentConversationId.value) || []
  })

  // 1. 获取所有会话列表
  async function fetchConversations() {
    isLoadingConversations.value = true
    try {
      const res = await getMyConversations()
      const newMap = new Map<string, Conversation>()
      res.conversations.forEach((conv) => newMap.set(conv._id, conv))
      conversationsMap.value = newMap
    } catch (error) {
      console.error('获取会话列表失败:', error)
    } finally {
      isLoadingConversations.value = false
    }
  }

  // 2. 选择一个会话（核心逻辑）
  async function selectConversation(id: string | null) {
    if (!id) {
      currentConversationId.value = null
      return
    }
    currentConversationId.value = id
    // 如果消息未被缓存，则去获取
    if (!messagesMap.value.has(id)) {
      await fetchMessages(id)
    }
    // (可选) 标记已读
    // handleMarkAsRead(id)
  }

  // 3. 获取单个会话的消息
  async function fetchMessages(id: string, cursor?: string) {
    isLoadingMessages.value = true
    try {
      const res = await getMessages(id, cursor)
      const existingMessages = messagesMap.value.get(id) || []
      // 将新获取的消息与已有的消息合并（用于分页加载）
      const allMessages = [...res.messages, ...existingMessages]
      // 用 Map 去重，key 为 _id
      const uniqueMessages = Array.from(new Map(allMessages.map((msg) => [msg._id, msg])).values())
      messagesMap.value.set(id, uniqueMessages)
    } catch (error) {
      console.error(`获取ID为 ${id} 的消息失败:`, error)
    } finally {
      isLoadingMessages.value = false
    }
  }

  // 4. 发送消息（带乐观更新）
  async function handleSendMessage(payload: SendMessagePayload) {
    const convId = currentConversationId.value
    if (!convId) return

    if (isSendingMessage.value) return
    isSendingMessage.value = true

    try {
      // (可以先做一个假的消息对象，立即显示在UI上，提升体验)
      const res = await sendMessage(convId, payload)
      const newMessage = res.data.message // 假设API返回新消息对象

      // 更新消息列表
      const existing = messagesMap.value.get(convId) || []
      messagesMap.value.set(convId, [...existing, newMessage])

      // (可选) 更新会话列表的摘要
      const conv = conversationsMap.value.get(convId)
      if (conv) {
        conv.lastMessageSnippet = newMessage.content
        conv.lastMessageAt = newMessage.createdAt
        conversationsMap.value.set(convId, conv)
      }
    } catch (error) {
      console.error(`发送消息到 ${convId} 失败:`, error)
    } finally {
      isSendingMessage.value = false
    }
  }

  // 5. 标记已读
  async function handleMarkAsRead(id: string) {
    const conv = conversationsMap.value.get(id)
    // 如果本来就有未读数，才发送请求并更新状态
    if (conv && conv.unreadCount > 0) {
      try {
        await markAsRead(id)
        conv.unreadCount = 0 // 本地状态更新
        conversationsMap.value.set(id, conv)
      } catch (error) {
        console.error(`标记 ${id} 已读失败:`, error)
      }
    }
  }

  return {
    handleMarkAsRead,
    // State
    conversationsMap,
    messagesMap,
    currentConversationId,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    // Getters
    conversationList,
    currentConversation,
    currentMessages,
    // Actions
    fetchConversations,
    selectConversation,
    fetchMessages,
    handleSendMessage,
  }
})

export default useChatStore
