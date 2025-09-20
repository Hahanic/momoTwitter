import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { fetchPosts, fetchFollowingPosts } from '@/api'
import { useUserStore, usePostCacheStore, usePostInteractionStore } from '@/stores'
import type { Post } from '@/types'

type FeedType = 'forYou' | 'following'

const usePostFeedStore = defineStore('postFeed', () => {
  const postCacheStore = usePostCacheStore()
  const interactionStore = usePostInteractionStore()
  const usersStore = useUserStore()

  // 当前激活的帖子流类型
  const activeFeedType = ref<FeedType>('forYou')

  // 双流数据缓存
  const feedMap = {
    forYou: {
      postIds: ref<string[]>([]),
      nextCursor: ref<string | null>(null),
      hasMore: ref(false),
      isLoading: ref(false),
      isRefreshing: ref(false),
    },
    following: {
      postIds: ref<string[]>([]),
      nextCursor: ref<string | null>(null),
      hasMore: ref(false),
      isLoading: ref(false),
      isRefreshing: ref(false),
    },
  }

  // 当前tab的帖子列表
  const posts = computed(() => {
    const ids = feedMap[activeFeedType.value].postIds.value
    return ids.map((id) => postCacheStore.getPost(id)).filter(Boolean) as Post[]
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
      postCacheStore.addPosts(response.posts)
      feed.postIds.value = response.posts.map((post) => post._id)
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
      postCacheStore.addPosts(response.posts)
      const newPostIds = response.posts.map((post) => post._id)
      feed.postIds.value.push(...newPostIds)
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
      postCacheStore.addPosts(response.posts)
      feed.postIds.value = response.posts.map((post) => post._id)
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
        feedMap.forYou.postIds.value.unshift(newPost._id)
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
    feed.postIds.value = []
    feed.nextCursor.value = null
    feed.hasMore.value = false
    feed.isLoading.value = false
    feed.isRefreshing.value = false
  }

  // 切换tab
  function switchFeedType(type: FeedType) {
    try {
      if (type === 'following' && !usersStore.isAuthenticated) {
        throw new Error('请先登录')
      }
      if (activeFeedType.value === type) return
      activeFeedType.value = type
      // 如果目标流还没加载过，自动加载
      if (feedMap[type].postIds.value.length === 0) {
        loadInitialPosts()
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
