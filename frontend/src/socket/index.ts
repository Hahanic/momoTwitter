import { io, Socket } from 'socket.io-client'

import { useChatStore } from '@/stores'

let socket: Socket | null = null

export function initSocket(token: string) {
  if (socket) return socket
  socket = io(import.meta.env.VITE_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
  })
  const chatStore = useChatStore()

  socket.on('connect', () => {
    console.log('socket connected')
  })

  // 初始化 presence
  socket.on('presence:init', (payload: { onlineUserIds: string[] }) => {
    console.log('presence:init', payload)
    chatStore.setInitialOnline(payload.onlineUserIds)
  })

  // 实时 presence 更新
  socket.on('presence', ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
    chatStore.updatePresence(userId, status)
  })

  socket.on('newConversation', ({ conversation }) => {
    console.log('收到一个新的会话邀请:', conversation)
    chatStore.addNewConversation(conversation)
  })

  socket.on('newMessage', ({ conversationId, message }) => {
    // 如果本地不存在该会话，刷新一次列表
    if (!chatStore.conversationsMap.has(conversationId)) {
      chatStore.fetchConversations().then(() => {
        chatStore.appendIncomingMessage(conversationId, message)
      })
    } else {
      chatStore.appendIncomingMessage(conversationId, message)
    }
  })

  socket.on('conversationUpdated', (payload) => {
    chatStore.updateConversationMeta(payload.conversationId, payload)
  })

  return socket
}

export function getSocket() {
  return socket
}
