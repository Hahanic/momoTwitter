import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import usePostCacheStore from './usePostCacheStore'

import { fetchUserPostsByCategory } from '@/api/index.ts'
import { useUserStore } from '@/stores'
import { type MinimalUser, type Post, type TimelineItem } from '@/types'

type FeedCategory = 'posts' | 'replies' | 'likes' | 'bookmarks'

type TimelineItemRef = {
  postId: string
  type: 'post' | 'retweet'
  timestamp: string
  retweetedBy?: MinimalUser
}

const useUserPostStore = defineStore('userPost', () => {
  const cache = usePostCacheStore()
  const userStore = useUserStore()

  // 各分类 ID 列表
  // posts 分类：使用时间线引用而非纯 ID 列表
  const postItems = ref<TimelineItemRef[]>([])
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

  // 计算属性：posts 分类下的时间线项（含转推/事件时间）
  const postsTimeline = computed(
    () =>
      postItems.value
        .map((refItem) => {
          const post = cache.getPost(refItem.postId)
          if (!post) return null
          return {
            type: refItem.type,
            timestamp: refItem.timestamp,
            retweetedBy: refItem.retweetedBy,
            data: post,
          } as TimelineItem
        })
        .filter(Boolean) as TimelineItem[]
  )

  const replies = computed(() => replyIds.value.map((id) => cache.getPost(id)).filter(Boolean) as Post[])
  const likes = computed(() => likeIds.value.map((id) => cache.getPost(id)).filter(Boolean) as Post[])
  const bookmarks = computed(() => bookmarkIds.value.map((id) => cache.getPost(id)).filter(Boolean) as Post[])

  function getListRef(category: Exclude<FeedCategory, 'posts'>) {
    switch (category) {
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

    if (loadingMap.value[category]) return
    if (!hasMoreMap.value[category]) return
    // posts 分类单独处理
    if (category !== 'posts') {
      const listRef = getListRef(category)
      if (
        listRef.value.length > 0 &&
        !options.refresh &&
        cursors.value[category] === null &&
        !hasMoreMap.value[category]
      ) {
        return
      }
    } else {
      if (
        postItems.value.length > 0 &&
        !options.refresh &&
        cursors.value[category] === null &&
        !hasMoreMap.value[category]
      ) {
        return
      }
    }

    loadingMap.value[category] = true
    try {
      const cursor = cursors.value[category]
      const res = await fetchUserPostsByCategory(category, username, cursor)
      if (category === 'posts') {
        // 后端 posts 分类返回 TimelineItem[]
        const items = res.posts as unknown as TimelineItem[]
        cache.addPosts(items.map((it) => it.data))
        const newRefs: TimelineItemRef[] = items.map((it) => ({
          postId: it.data._id,
          type: it.type,
          timestamp: it.timestamp,
          retweetedBy: it.retweetedBy,
        }))
        // 去重：按 type-postId-timestamp 组合键
        const existingKeys = new Set(postItems.value.map((i) => `${i.type}:${i.postId}:${i.timestamp}`))
        for (const ref of newRefs) {
          const key = `${ref.type}:${ref.postId}:${ref.timestamp}`
          if (!existingKeys.has(key)) {
            postItems.value.push(ref)
            existingKeys.add(key)
          }
        }
      } else {
        // 其他分类仍为 Post[]
        const listRef = getListRef(category as Exclude<FeedCategory, 'posts'>)
        const postsArr = res.posts as unknown as Post[]
        cache.addPosts(postsArr)
        const newIds = postsArr.map((p) => p._id)
        const existing = new Set(listRef.value)
        for (const id of newIds) {
          if (!existing.has(id)) listRef.value.push(id)
        }
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
    if (category === 'posts') {
      postItems.value = []
    } else {
      getListRef(category as Exclude<FeedCategory, 'posts'>).value = []
    }
    cursors.value[category] = null
    hasMoreMap.value[category] = true
    loadingMap.value[category] = false
  }

  function resetAll() {
    ;(['posts', 'replies', 'likes', 'bookmarks'] as FeedCategory[]).forEach(resetCategory)
  }

  // 从 posts 时间线中移除当前用户对某个 post 的转推项
  function removeRetweetItemsByUser(postId: string, user: { _id?: string; username?: string }) {
    const removed: TimelineItemRef[] = []
    postItems.value = postItems.value.filter((item) => {
      const isSelfRt =
        item.type === 'retweet' &&
        item.postId === postId &&
        item.retweetedBy &&
        ((user._id && item.retweetedBy._id === user._id) ||
          (user.username && item.retweetedBy.username === user.username))
      if (isSelfRt) removed.push(item)
      return !isSelfRt
    })
    return removed
  }

  // 将之前移除的转推项恢复（用于回滚）
  function addRetweetItems(items: TimelineItemRef[]) {
    if (!items || !items.length) return
    postItems.value.push(...items)
  }

  return {
    // 状态
    postItems,
    replyIds,
    likeIds,
    bookmarkIds,
    cursors,
    hasMoreMap,
    loadingMap,
    // 映射后的实际数据
    postsTimeline,
    replies,
    likes,
    bookmarks,
    // 方法
    loadCategory,
    resetCategory,
    resetAll,
    removeRetweetItemsByUser,
    addRetweetItems,
  }
})

export default useUserPostStore
