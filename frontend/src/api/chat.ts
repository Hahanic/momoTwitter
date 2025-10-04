import axiosInstance from './axiosInstance'

import {
  type Conversation,
  type ChatMessage,
  type CreateGroupChatPayload,
  type CreatePrivateChatPayload,
  type CreateConversationResponse,
} from '@/types'

// 获取会话列表
export const getMyConversations = async (): Promise<{ message: string; conversations: Conversation[] }> => {
  return await axiosInstance.get('/chat')
}

// 创建新会话
export const createConversationAPI = async (
  data: CreateGroupChatPayload | CreatePrivateChatPayload
): Promise<CreateConversationResponse> => {
  return await axiosInstance.post('/chat', data)
}

// 获取单个会话的消息
export const getMessages = async (
  id: string,
  cursor?: string
): Promise<{ message: string; messages: ChatMessage[]; nextCursor: string | null }> => {
  return await axiosInstance.get(`/chat/${id}/messages`, { params: { cursor } })
}
