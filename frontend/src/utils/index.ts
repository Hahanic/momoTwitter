// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  // 如果它有值，说明函数正处于冷却期。
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (timeoutId) return
    const result = func.apply(this, args)

    timeoutId = setTimeout(() => {
      timeoutId = null
    }, delay)

    return result
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
      timeoutId = null
    }, delay)
  }
}
// 格式化日期
export const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 小于1天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 大于1天，显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  })
}
export const formatTime = (timestamp?: string) => {
  if (!timestamp) return '刚刚'

  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 大于24小时，显示具体时间
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDatePostDetail = (dateStr: string) => {
  const date = new Date(dateStr)

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours > 12 ? '下午' : '上午'
  const formatDateHours = hours % 12 || 12 // 转换为12小时制
  const formatDateMinutes = minutes < 10 ? '0' + minutes : minutes

  return `${ampm}${formatDateHours}:${formatDateMinutes} · ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}
