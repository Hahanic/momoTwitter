export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
  updatedAt?: string
}

export interface AiConversation {
  _id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface AiChatResponse {
  choices: Array<{
    delta: {
      role?: string
      content?: string
    }
  }>
  conversationId?: string
}

export interface AiChatRequest {
  message: string
}
