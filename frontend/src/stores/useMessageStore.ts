import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MessageOptions {
  id: number
  type: 'info' | 'success' | 'error' | 'warning'
  content: string
  duration?: number
}

export const useMessageStore = defineStore('message', () => {
  // 存储所有消息的数组
  const messages = ref<MessageOptions[]>([])

  // 添加消息的方法
  const addMessage = (options: Omit<MessageOptions, 'id'>) => {
    // 唯一id
    const id = Date.now() + Math.random()
    const duration = options.duration ?? 3000

    messages.value.push({ ...options, id, duration })

    if (duration > 0) {
      setTimeout(() => {
        removeMessage(id)
      }, duration)
    }

    return id
  }

  // 移除消息的方法
  const removeMessage = (id: number) => {
    messages.value = messages.value.filter((msg) => msg.id !== id)
  }

  return {
    messages,
    addMessage,
    removeMessage,
  }
})
