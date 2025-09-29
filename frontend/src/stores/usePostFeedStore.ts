import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { fetchPosts, fetchFollowingPosts } from '@/api'
import { useUserStore, usePostCacheStore, usePostInteractionStore } from '@/stores'
import { type MinimalUser, type TimelineItem } from '@/types'

type FeedType = 'forYou' | 'following'

// 仅存储时间线项的引用信息，实际的 Post 数据复用缓存
type TimelineItemRef = {
  postId: string
  type: 'post' | 'retweet'
  timestamp: string
  retweetedBy?: MinimalUser
}

const usePostFeedStore = defineStore('postFeed', () => {
  const postCacheStore = usePostCacheStore()
  const interactionStore = usePostInteractionStore()
  const usersStore = useUserStore()

  // 当前激活的帖子流类型
  const activeFeedType = ref<FeedType>('forYou')

  // 双流数据缓存
  const feedMap = {
    forYou: {
      items: ref<TimelineItemRef[]>([]),
      nextCursor: ref<string | null>(null),
      hasMore: ref(false),
      isLoading: ref(false),
      isRefreshing: ref(false),
    },
    following: {
      items: ref<TimelineItemRef[]>([]),
      nextCursor: ref<string | null>(null),
      hasMore: ref(false),
      isLoading: ref(false),
      isRefreshing: ref(false),
    },
  }

  // 当前tab的帖子列表
  const posts = computed(() => {
    const items = feedMap[activeFeedType.value].items.value
    // 组装 TimelineItem：将缓存中的 Post 填入 data
    return items
      .map((refItem) => {
        const post = postCacheStore.getPost(refItem.postId)
        if (!post) return null
        return {
          type: refItem.type,
          timestamp: refItem.timestamp,
          retweetedBy: refItem.retweetedBy,
          data: post,
        } as TimelineItem
      })
      .filter(Boolean) as TimelineItem[]
  })

  // 初始加载帖子
  async function loadInitialPosts() {
    const type = activeFeedType.value
    const feed = feedMap[type]
    if (feed.isLoading.value) return
    feed.isLoading.value = true
    try {
      resetFeed(type)
      let response
      if (type === 'forYou') {
        response = await fetchPosts(null)
      } else {
        response = await fetchFollowingPosts(null)
      }
      postCacheStore.addPosts(response.posts.map((item) => item.data))
      feed.items.value = response.posts.map((item) => ({
        postId: item.data._id,
        type: item.type,
        timestamp: item.timestamp,
        retweetedBy: item.retweetedBy,
      }))
      feed.nextCursor.value = response.nextCursor
      feed.hasMore.value = response.nextCursor !== null
    } catch (error) {
      feed.hasMore.value = false
      console.error('加载初始帖子失败:', error)
      throw error
    } finally {
      feed.isLoading.value = false
    }
  }

  // 加载更多帖子
  async function loadMorePosts() {
    const type = activeFeedType.value
    const feed = feedMap[type]
    if (feed.isLoading.value || !feed.hasMore.value) return
    feed.isLoading.value = true
    try {
      let response
      if (type === 'forYou') {
        response = await fetchPosts(feed.nextCursor.value)
      } else {
        response = await fetchFollowingPosts(feed.nextCursor.value)
      }
      postCacheStore.addPosts(response.posts.map((item) => item.data))
      const newItems = response.posts.map((item) => ({
        postId: item.data._id,
        type: item.type,
        timestamp: item.timestamp,
        retweetedBy: item.retweetedBy,
      }))
      feed.items.value.push(...newItems)
      feed.nextCursor.value = response.nextCursor
      feed.hasMore.value = response.nextCursor !== null
    } catch (error) {
      console.error('加载更多帖子失败:', error)
      throw error
    } finally {
      feed.isLoading.value = false
    }
  }

  // 刷新帖子流
  async function refreshPosts() {
    const type = activeFeedType.value
    const feed = feedMap[type]
    if (feed.isRefreshing.value) return
    feed.isRefreshing.value = true
    try {
      let response
      if (type === 'forYou') {
        response = await fetchPosts(null)
      } else {
        response = await fetchFollowingPosts(null)
      }
      postCacheStore.addPosts(response.posts.map((item) => item.data))
      feed.items.value = response.posts.map((item) => ({
        postId: item.data._id,
        type: item.type,
        timestamp: item.timestamp,
        retweetedBy: item.retweetedBy,
      }))
      feed.nextCursor.value = response.nextCursor
      feed.hasMore.value = response.nextCursor !== null
    } catch (error: any) {
      throw error.message ? new Error(` ${error.message}`) : new Error('刷新帖子失败')
    } finally {
      feed.isRefreshing.value = false
    }
  }

  // 创建新帖子并添加到流顶部
  async function createAndAddPost(payload: Parameters<typeof interactionStore.handleCreatePost>[0]) {
    try {
      const newPost = await interactionStore.handleCreatePost(payload)

      // 如果是标准帖子，添加到流的顶部
      if (newPost.postType === 'standard') {
        feedMap.forYou.items.value.unshift({
          postId: newPost._id,
          type: 'post',
          timestamp: newPost.createdAt,
        })
      }

      return newPost
    } catch (error) {
      console.error('创建帖子失败:', error)
      throw error
    }
  }

  // 重置帖子流
  function resetFeed(type: FeedType = activeFeedType.value) {
    const feed = feedMap[type]
    feed.items.value = []
    feed.nextCursor.value = null
    feed.hasMore.value = false
    feed.isLoading.value = false
    feed.isRefreshing.value = false
  }

  // 切换tab
  async function switchFeedType(type: FeedType) {
    try {
      if (type === 'following' && !usersStore.isAuthenticated) {
        throw new Error('请先登录')
      }
      if (activeFeedType.value === type) return
      activeFeedType.value = type
      // 如果目标流还没加载过，自动加载
      if (feedMap[type].items.value.length === 0) {
        await loadInitialPosts()
      }
    } catch (error: any) {
      throw error.message ? new Error(` ${error.message}`) : new Error('切换帖子流失败')
    }
  }

  return {
    // tab
    activeFeedType,
    switchFeedType,

    // 当前tab帖子流
    posts,
    isLoading: computed(() => feedMap[activeFeedType.value].isLoading.value),
    isRefreshing: computed(() => feedMap[activeFeedType.value].isRefreshing.value),
    hasMore: computed(() => feedMap[activeFeedType.value].hasMore.value),

    // 操作
    loadInitialPosts,
    loadMorePosts,
    refreshPosts,
    createAndAddPost,
    resetFeed,
  }
})

export default usePostFeedStore
