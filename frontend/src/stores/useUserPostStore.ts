import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import usePostCacheStore from './usePostCacheStore'

import { fetchUserPostsByCategory } from '@/api/index.ts'
import { useUserStore } from '@/stores'
import type { Post } from '@/types'

type FeedCategory = 'posts' | 'replies' | 'likes' | 'bookmarks'

const useUserPostStore = defineStore('userPost', () => {
  const cache = usePostCacheStore()
  const userStore = useUserStore()

  // 各分类 ID 列表
  const postIds = ref<string[]>([])
  const replyIds = ref<string[]>([])
  const likeIds = ref<string[]>([])
  const bookmarkIds = ref<string[]>([])

  // 分页游标
  const cursors = ref<Record<FeedCategory, string | null>>({
    posts: null,
    replies: null,
    likes: null,
    bookmarks: null,
  })
  const hasMoreMap = ref<Record<FeedCategory, boolean>>({
    posts: true,
    replies: true,
    likes: true,
    bookmarks: true,
  })

  const loadingMap = ref<Record<FeedCategory, boolean>>({
    posts: false,
    replies: false,
    likes: false,
    bookmarks: false,
  })

  // 计算属性：通过缓存映射实际帖子
  const posts = computed(() => postIds.value.map((id) => cache.getPost(id)).filter(Boolean) as Post[])
  const replies = computed(() => replyIds.value.map((id) => cache.getPost(id)).filter(Boolean) as Post[])
  const likes = computed(() => likeIds.value.map((id) => cache.getPost(id)).filter(Boolean) as Post[])
  const bookmarks = computed(() => bookmarkIds.value.map((id) => cache.getPost(id)).filter(Boolean) as Post[])

  function getListRef(category: FeedCategory) {
    switch (category) {
      case 'posts':
        return postIds
      case 'replies':
        return replyIds
      case 'likes':
        return likeIds
      case 'bookmarks':
        return bookmarkIds
    }
  }

  // 通用加载函数
  async function loadCategory(category: FeedCategory, username: string, options: { refresh?: boolean } = {}) {
    if (!username) return
    // 收藏只允许本人查看：使用传入的 username 对比已登录用户，避免 currentUserProfile 未加载导致误拒
    if (category === 'bookmarks' && username !== userStore.user?.username) return

    // refresh: 清空后重新拉取
    if (options.refresh) {
      resetCategory(category)
    }

    const listRef = getListRef(category)
    if (loadingMap.value[category]) return
    if (!hasMoreMap.value[category]) return
    // 首次加载时允许；如果已加载且未要求刷新，直接返回
    if (
      listRef.value.length > 0 &&
      !options.refresh &&
      cursors.value[category] === null &&
      !hasMoreMap.value[category]
    ) {
      return
    }

    loadingMap.value[category] = true
    try {
      const cursor = cursors.value[category]
      const res = await fetchUserPostsByCategory(category, username, cursor)
      cache.addPosts(res.posts)
      const newIds = res.posts.map((p) => p._id)
      // 去重（可能后端变化重复返回）
      const existing = new Set(listRef.value)
      for (const id of newIds) {
        if (!existing.has(id)) listRef.value.push(id)
      }
      cursors.value[category] = res.nextCursor
      hasMoreMap.value[category] = res.nextCursor !== null
    } catch (e) {
      // 失败时停止更多加载，避免无限重试；可根据需要改成标记错误
      hasMoreMap.value[category] = false
      console.error('[loadCategory error]', category, e)
    } finally {
      loadingMap.value[category] = false
    }
  }

  function resetCategory(category: FeedCategory) {
    getListRef(category).value = []
    cursors.value[category] = null
    hasMoreMap.value[category] = true
    loadingMap.value[category] = false
  }

  function resetAll() {
    ;(['posts', 'replies', 'likes', 'bookmarks'] as FeedCategory[]).forEach(resetCategory)
  }

  return {
    // 状态
    postIds,
    replyIds,
    likeIds,
    bookmarkIds,
    cursors,
    hasMoreMap,
    loadingMap,
    // 映射后的实际数据
    posts,
    replies,
    likes,
    bookmarks,
    // 方法
    loadCategory,
    resetCategory,
    resetAll,
  }
})

export default useUserPostStore
