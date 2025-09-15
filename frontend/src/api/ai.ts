import axiosInstance from './axiosInstance'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
  updatedAt?: string
}

export interface Conversation {
  _id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ChatResponse {
  choices: Array<{
    delta: {
      role?: string
      content?: string
    }
  }>
  conversationId?: string
}

export interface ChatRequest {
  message: string
}

// 获取对话列表
export const getConversations = (): Promise<{ message: { conversationList: Conversation[] } }> => {
  return axiosInstance.get('/bot/chat')
}

// 获取单个对话历史
export const getConversationHistory = (conversationId: string): Promise<{ message: ChatMessage[] }> => {
  return axiosInstance.get(`/bot/chat/${conversationId}`)
}

// AI 聊天流式接口，创建新对话
export const createNewChatStream = async (
  request: ChatRequest,
  onMessage: (data: ChatResponse) => void,
  onError: (error: Error) => void,
  onComplete: () => void
) => {
  return chatStream('/bot/chat', request, onMessage, onError, onComplete)
}

// AI 聊天流式接口，继续现有对话
export const continueConversationStream = async (
  conversationId: string,
  request: ChatRequest,
  onMessage: (data: ChatResponse) => void,
  onError: (error: Error) => void,
  onComplete: () => void
) => {
  return chatStream(`/bot/chat/${conversationId}`, request, onMessage, onError, onComplete)
}

// 通用的流式聊天函数
const chatStream = async (
  url: string,
  request: ChatRequest,
  onMessage: (data: ChatResponse) => void,
  onError: (error: Error) => void,
  onComplete: () => void
) => {
  try {
    // 获取 token
    const userDataString = localStorage.getItem('user')
    if (!userDataString) {
      throw new Error('用户未登录')
    }

    const userData = JSON.parse(userDataString)
    const token = userData.accessToken

    if (!token) {
      throw new Error('Token 不存在')
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('无法读取响应流')
    }

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onComplete()
        break
      }

      buffer += decoder.decode(value, { stream: true })

      // 处理完整的事件
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留不完整的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()

          if (data === '[DONE]') {
            onComplete()
            return
          }

          try {
            const parsedData: ChatResponse = JSON.parse(data)
            onMessage(parsedData)
          } catch (error) {
            console.error('解析 SSE 数据失败:', error, 'Data:', data)
          }
        }
      }
    }
  } catch (error) {
    console.error('聊天流错误:', error)
    onError(error as Error)
  }
}

// 聊天接口（非流式）
export const chatWithBot = async (message: string, conversationId?: string) => {
  try {
    const url = conversationId ? `/bot/chat/${conversationId}` : '/bot/chat'
    const response = await axiosInstance.post(url, { message })
    return response
  } catch (error) {
    console.error('AI 聊天失败:', error)
    throw error
  }
}

// 删除对话
export const deleteConversation = async (conversationId: string) => {
  try {
    const response = await axiosInstance.delete(`/bot/chat/${conversationId}`)
    return response.data
  } catch (error) {
    console.error('删除对话失败:', error)
    throw error
  }
}

// 翻译帖子
export const translatePost = (
  postId: string,
  targetLanguage: string = 'Simplified Chinese'
): Promise<{ message: string; translatedContent: string; language: string }> => {
  return axiosInstance.post(`/posts/${postId}/translate`, { targetLanguage })
}
