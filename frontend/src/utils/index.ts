// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  // 如果它有值，说明函数正处于冷却期。
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    if (timeoutId) return
    const result = func.apply(this, args)

    timeoutId = setTimeout(() => {
      timeoutId = null
    }, delay)

    return result
  }
}
