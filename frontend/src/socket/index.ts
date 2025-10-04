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

  // 初始化在线用户列表
  socket.on('presence:init', (payload: { onlineUserIds: string[] }) => {
    chatStore.setInitialOnline(payload.onlineUserIds)
  })

  // 实时更新在线用户列表
  socket.on('presence', ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
    chatStore.updatePresence(userId, status)
  })

  // 收到新会话
  socket.on('newConversation', ({ conversation }) => {
    chatStore.addNewConversation(conversation)
  })

  // 收到新消息
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

  // 更新会话元信息（最新消息和最新时间）
  socket.on('conversationUpdated', (payload) => {
    chatStore.updateConversationMeta(payload.conversationId, payload)
  })

  return socket
}

export function getSocket() {
  return socket
}
