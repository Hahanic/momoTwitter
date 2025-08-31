import { useMessageStore } from '@/stores/useMessageStore'

export const useMessage = () => {
  const messageStore = useMessageStore()

  const add = (options: Omit<Parameters<typeof messageStore.addMessage>[0], 'id'>) => {
    return messageStore.addMessage(options)
  }

  return {
    info: (content: string, options: { duration?: number } = {}) => {
      return add({ type: 'info', content, ...options })
    },
    success: (content: string, options: { duration?: number } = {}) => {
      return add({ type: 'success', content, ...options })
    },
    warning: (content: string, options: { duration?: number } = {}) => {
      return add({ type: 'warning', content, ...options })
    },
    error: (content: string, options: { duration?: number } = {}) => {
      return add({ type: 'error', content, ...options })
    },
    destroy: (id: number) => {
      messageStore.removeMessage(id)
    },
  }
}
