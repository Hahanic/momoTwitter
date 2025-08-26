import { watch, onUnmounted, type Ref, ref, computed } from 'vue'

interface UseInfiniteScrollOptions {
  loadMore: () => Promise<void>
  isLoading: Ref<boolean>
  hasMore: Ref<boolean>
  scrollContainerRef: Ref<HTMLElement | null>
  rootMargin?: string
  debounceMs?: number
}

export function useInfiniteScroll({
  loadMore,
  isLoading,
  hasMore,
  scrollContainerRef,
  rootMargin = '0px 0px 100px 0px',
  debounceMs = 300,
}: UseInfiniteScrollOptions) {
  const targetEl = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // 防抖的加载函数
  const debouncedLoadMore = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(async () => {
      if (hasMore.value && !isLoading.value) {
        try {
          await loadMore()
        } catch (error) {
          console.error('无限滚动加载失败:', error)
        }
      }
    }, debounceMs)
  }

  const cleanupObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  const setupObserver = (target: HTMLElement, container: HTMLElement) => {
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore.value && !isLoading.value) {
          debouncedLoadMore()
        }
      },
      {
        root: container,
        rootMargin,
        threshold: 0,
      }
    )

    observer.observe(target)
  }

  // 监听目标元素和滚动容器的变化
  watch(
    [targetEl, scrollContainerRef],
    ([newTarget, newScrollContainer]) => {
      cleanupObserver()
      if (newTarget && newScrollContainer) {
        setupObserver(newTarget, newScrollContainer)
      }
    },
    { immediate: true }
  )

  onUnmounted(cleanupObserver)

  const canLoadMore = computed(() => hasMore.value && !isLoading.value)

  return {
    targetEl,
    canLoadMore,
  }
}
