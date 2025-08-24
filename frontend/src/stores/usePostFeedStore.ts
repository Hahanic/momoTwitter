import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import usePostCacheStore from './usePostCacheStore.ts'
import usePostInteractionStore from './usePostInteractionStore.ts'

import { getPosts as apiGetPosts } from '@/api'
import type { RecievePostPayload } from '@/types'

const usePostFeedStore = defineStore('postFeed', () => {
  const postCacheStore = usePostCacheStore()
  const interactionStore = usePostInteractionStore()

  // 主页帖子流状态
  const postIds = ref<string[]>([]) // 只存储ID，实际数据从cache获取
  const isLoading = ref(false)
  const isRefreshing = ref(false)

  // 分页状态
  const nextCursor = ref<string | null>(null)
  const hasMore = ref(false)

  // 计算属性：实际的帖子列表
  const posts = computed(() => {
    return postIds.value.map((id) => postCacheStore.getPost(id)).filter(Boolean) as RecievePostPayload[]
  })

  // 计算属性：加载状态统计
  const loadingStats = computed(() => {
    return {
      isLoading: isLoading.value,
      isRefreshing: isRefreshing.value,
      hasMore: hasMore.value,
      totalPosts: postIds.value.length,
      cachedPosts: posts.value.length,
    }
  })

  // 初始加载帖子
  async function loadInitialPosts() {
    if (isLoading.value) return

    isLoading.value = true

    try {
      // 重置数据
      resetFeed()

      const response = await apiGetPosts(null)

      // 将帖子添加到缓存
      postCacheStore.addPosts(response.posts)

      // 更新ID列表
      postIds.value = response.posts.map((post) => post._id)

      // 更新分页信息
      nextCursor.value = response.nextCursor
      hasMore.value = response.nextCursor !== null
    } catch (error) {
      console.error('初始加载帖子失败:', error)
      // 出错时重置状态
      hasMore.value = false
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 加载更多帖子
  async function loadMorePosts() {
    if (isLoading.value || !hasMore.value) {
      return
    }

    isLoading.value = true

    try {
      const response = await apiGetPosts(nextCursor.value)

      // 将新帖子添加到缓存
      postCacheStore.addPosts(response.posts)

      // 追加新的ID到列表
      const newPostIds = response.posts.map((post) => post._id)
      postIds.value.push(...newPostIds)

      // 更新分页信息
      nextCursor.value = response.nextCursor
      hasMore.value = response.nextCursor !== null
    } catch (error) {
      console.error('加载更多帖子失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 刷新帖子流
  async function refreshPosts() {
    if (isRefreshing.value) return

    isRefreshing.value = true

    try {
      const response = await apiGetPosts(null)

      // 将帖子添加到缓存
      postCacheStore.addPosts(response.posts)

      // 重新设置ID列表
      postIds.value = response.posts.map((post) => post._id)

      // 重置分页信息
      nextCursor.value = response.nextCursor
      hasMore.value = response.nextCursor !== null

      console.log('刷新帖子:', posts.value.length)
    } catch (error) {
      console.error('刷新帖子失败:', error)
      throw error
    } finally {
      isRefreshing.value = false
    }
  }

  // 创建新帖子并添加到流顶部
  async function createAndAddPost(payload: Parameters<typeof interactionStore.createPost>[0]) {
    try {
      const newPost = await interactionStore.createPost(payload)

      // 如果是标准帖子，添加到流的顶部
      if (newPost.postType === 'standard') {
        postIds.value.unshift(newPost._id)
      }

      return newPost
    } catch (error) {
      console.error('创建帖子失败:', error)
      throw error
    }
  }

  // 重置帖子流
  function resetFeed() {
    postIds.value = []
    nextCursor.value = null
    hasMore.value = false
    isLoading.value = false
    isRefreshing.value = false
  }

  // 预加载帖子详情（用于优化用户体验）
  async function preloadPostDetails(count: number = 5) {
    const visiblePostIds = postIds.value.slice(0, count)

    for (const postId of visiblePostIds) {
      const post = postCacheStore.getPost(postId)
      if (post && post.postType === 'reply' && post.parentPostId) {
        // 预加载父帖子
        try {
          await postCacheStore.fetchPostIfNotExists(post.parentPostId)
        } catch (error) {
          console.warn(`预加载父帖子失败 ${post.parentPostId}:`, error)
        }
      }
    }
  }

  return {
    // 状态
    postIds,
    isLoading,
    isRefreshing,
    hasMore,

    // 计算属性
    posts,
    loadingStats,

    // 核心方法
    loadInitialPosts,
    loadMorePosts,
    refreshPosts,
    createAndAddPost,
    resetFeed,

    // 优化方法
    preloadPostDetails,
  }
})

export default usePostFeedStore
