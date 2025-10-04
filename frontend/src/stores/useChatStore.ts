import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getMyConversations, getMessages, createConversationAPI } from '@/api'
import { getSocket } from '@/socket'
import { useUserStore } from '@/stores'
import type {
  Conversation,
  ChatMessage,
  SendMessagePayload,
  CreatePrivateChatPayload,
  CreateGroupChatPayload,
} from '@/types'

const useChatStore = defineStore('chat', () => {
  // 会话列表
  const conversationsMap = ref<Map<string, { cursor: string; conversation: Conversation }>>(new Map())
  // 每个会话的消息列表
  const messagesMap = ref<Map<string, ChatMessage[]>>(new Map())
  // 每个会话是否还有更多历史
  const hasMoreMap = ref<Map<string, boolean>>(new Map())
  // 当前激活的会话ID
  const currentConversationId = ref<string | null>(null)
  // 发送消息时的
  const isSendingMessage = ref(false)
  // 加载状态
  const isLoadingConversations = ref(false)
  const isLoadingMessages = ref(false)
  const isLoadingMoreMessages = ref(false)
  // 在线用户集合（仅保存与我有会话关系的其他用户ID）
  const onlineUserIds = ref<Set<string>>(new Set())
  // 是否已加载过该会话的历史记录（至少一次分页请求）
  const historyLoadedMap = ref<Map<string, boolean>>(new Map())

  // 将会话 Map 转换为按最新消息排序的数组，供 UI 使用
  const conversationList = computed(() => {
    const list = Array.from(conversationsMap.value.values()).map((item) => item.conversation)
    list.sort((a, b) => {
      if (a.isSticky && !b.isSticky) return -1
      if (!a.isSticky && b.isSticky) return 1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
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
      const newMap = new Map<string, { cursor: string; conversation: Conversation }>()
      res.conversations.forEach((conv) => {
        newMap.set(conv._id, { cursor: '', conversation: conv })
        // 初始标记：尚未加载过历史
        historyLoadedMap.value.set(conv._id, false)
      })
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

    // 第一次进入或未曾拉取历史时必须拉取历史
    const historyLoaded = historyLoadedMap.value.get(id)
    if (!historyLoaded) {
      await fetchMessages(id)
    } else if (!messagesMap.value.has(id)) {
      // 异常兜底：如果没有本地消息缓存也拉取一次
      await fetchMessages(id)
    }
    if (!hasMoreMap.value.has(id)) hasMoreMap.value.set(id, true)

    const convHolder = conversationsMap.value.get(id)
    if (convHolder) {
      // 标记已读：进入会话时总是发一次 socket 标记，确保后端 lastReadAt 及时更新
      const socket = getSocket()
      if (socket && socket.connected) {
        socket.emit('markRead', { conversationId: id })
        convHolder.conversation.unreadCount = 0
        conversationsMap.value.set(id, convHolder)
      }
    }
  }

  // 3. 获取单个会话的消息
  async function fetchMessages(id: string, cursor?: string) {
    const isLoadMore = !!cursor
    if (isLoadMore) {
      isLoadingMoreMessages.value = true
    } else {
      isLoadingMessages.value = true
    }
    try {
      const res = await getMessages(id, cursor)
      const existingMessages = messagesMap.value.get(id) || []

      // 将新获取的消息与已有的消息合并（用于分页加载）
      const allMessages = [...res.messages, ...existingMessages]
      // 用 Map 去重，key 为 _id
      const uniqueMessages = Array.from(new Map(allMessages.map((msg) => [msg._id, msg])).values())
      messagesMap.value.set(id, uniqueMessages)

      // 更新 cursor 与 hasMore
      const holder = conversationsMap.value.get(id)
      if (holder) {
        holder.cursor = res.nextCursor || ''
        conversationsMap.value.set(id, holder)
      }
      hasMoreMap.value.set(id, !!res.nextCursor)
      // 标记该会话已完成至少一次历史加载
      historyLoadedMap.value.set(id, true)
    } catch (error) {
      console.error(`获取ID为 ${id} 的消息失败:`, error)
    } finally {
      if (isLoadMore) {
        isLoadingMoreMessages.value = false
      } else {
        isLoadingMessages.value = false
      }
    }
  }

  // 4. 发送消息 通过 socket 发送
  async function handleSendMessage(payload: SendMessagePayload) {
    const convId = currentConversationId.value
    if (!convId) return

    const socket = getSocket()
    if (socket && socket.connected) {
      socket.emit('sendMessage', { conversationId: convId, ...payload })
    } else {
      console.warn('Socket 未连接，消息未发送')
    }
  }

  // 5. 加载更多
  async function loadMoreMessages(id: string) {
    if (!id) return
    if (isLoadingMoreMessages.value) return
    // 没有更多
    const hasMore = hasMoreMap.value.get(id)
    if (hasMore === false) return
    const holder = conversationsMap.value.get(id)
    const cursor = holder?.cursor || ''
    if (!cursor) {
      // 如果没有 cursor 说明后端已经无更多
      hasMoreMap.value.set(id, false)
      return
    }
    await fetchMessages(id, cursor)
  }

  // 6. 接收新消息（Socket 调用）
  function appendIncomingMessage(convId: string, msg: ChatMessage) {
    const myId = useUserStore().user?._id
    const list = messagesMap.value.get(convId) || []
    // 去重
    if (!list.find((m) => m._id === msg._id)) {
      messagesMap.value.set(convId, [...list, msg])
    }
    const holder = conversationsMap.value.get(convId)
    if (holder) {
      holder.conversation.lastMessageSnippet = msg.content || (msg.media?.length ? '[媒体]' : '')
      holder.conversation.lastMessageAt = msg.createdAt
      // 如果当前未在此会话界面，则增加未读
      const senderId = msg.senderId._id
      if (currentConversationId.value !== convId && senderId && myId && senderId !== myId) {
        holder.conversation.unreadCount = (holder.conversation.unreadCount || 0) + 1
      } else if (currentConversationId.value === convId && senderId && myId && senderId !== myId) {
        // 正在查看该会话且收到对方消息，立即标记已读
        const socket = getSocket()
        if (socket && socket.connected) {
          socket.emit('markRead', { conversationId: convId })
        }
      }
      conversationsMap.value.set(convId, holder)
    }
  }

  // 7. 接收新会话（Socket 调用）
  function addNewConversation(conv: Conversation) {
    if (!conversationsMap.value.has(conv._id)) {
      conversationsMap.value.set(conv._id, { cursor: '', conversation: conv })
      historyLoadedMap.value.set(conv._id, false)
    }
  }

  // 7. 更新会话元信息（Socket 调用）
  function updateConversationMeta(convId: string, meta: Partial<Conversation>) {
    const holder = conversationsMap.value.get(convId)
    if (holder) {
      holder.conversation = { ...holder.conversation, ...meta }
      conversationsMap.value.set(convId, holder)
    }
  }

  // 创建私聊/群组
  async function createConversation(params: CreatePrivateChatPayload | CreateGroupChatPayload) {
    try {
      const res = await createConversationAPI(params)
      const newConv = {
        _id: res.conversation._id,
        isGroup: res.conversation.isGroup,
        lastMessageSnippet: res.conversation.lastMessageSnippet,
        lastMessageAt: res.conversation.lastMessageAt,
        unreadCount: 0,
        isSticky: false,
        isMuted: false,
        username: res.conversation.username,
        displayName: res.conversation.displayName,
        displayAvatar: res.conversation.displayAvatar,
        // 仅私聊有效
        peerId: (res.conversation as any).peerId || '',
      }
      conversationsMap.value.set(newConv._id, { cursor: '', conversation: newConv })
      historyLoadedMap.value.set(newConv._id, false)
      selectConversation(newConv._id)
      return newConv._id
    } catch (error) {
      console.error('创建会话失败:', error)
    }
  }

  // 初始化在线用户集合
  function setInitialOnline(userIds: string[]) {
    onlineUserIds.value = new Set(userIds)
  }
  // 单个用户上下线事件
  function updatePresence(userId: string, status: 'online' | 'offline') {
    if (status === 'online') {
      onlineUserIds.value.add(userId)
    } else if (status === 'offline') {
      onlineUserIds.value.delete(userId)
    }
    // 触发响应式
    onlineUserIds.value = new Set(onlineUserIds.value)
  }

  return {
    // State
    hasMoreMap,
    isLoadingMoreMessages,
    conversationsMap,
    messagesMap,
    currentConversationId,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    onlineUserIds,
    // 内部标记（如需调试可观察）
    historyLoadedMap,
    // Getters
    conversationList,
    currentConversation,
    currentMessages,
    // Actions
    createConversation,
    addNewConversation,
    fetchConversations,
    loadMoreMessages,
    selectConversation,
    fetchMessages,
    handleSendMessage,
    appendIncomingMessage,
    updateConversationMeta,
    setInitialOnline,
    updatePresence,
  }
})

export default useChatStore
