import { defineStore } from 'pinia'
import { ref } from 'vue'

import useUserStore from './user'

import { createPost as apiCreatePost, getPosts as apiGetPost, apiLikePost } from '@/api'
import { type RecievePostPayload, type CreatePostPayload } from '@/types'

const usePostStore = defineStore('post', () => {
  // 储存帖子列表
  const posts = ref<RecievePostPayload[]>([])
  // 用户编辑的帖子
  // const editingPost = ref<CreatePostPayload | null>(null)
  // 控制发帖的状态
  const isPosting = ref<boolean>(false)
  // 控制加载帖子的状态
  const isLoading = ref<boolean>(false)
  // 控制正在点赞帖子的状态
  const isLiking = ref<boolean>(false)
  // 下一次请求的分页游标
  const nextCursor = ref<string | null>(null)
  const hasMore = ref<boolean>(true)

  // 获取userStore实例
  const userStore = useUserStore()

  // 发帖方法
  async function createPost(payload: CreatePostPayload) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法发帖')
    }
    isPosting.value = true
    try {
      // 调用API创建帖子
      const response = await apiCreatePost(payload)
      const newPost = response
      // 将新帖子添加到列表最前面
      if (newPost.postType === 'standard') {
        posts.value.unshift(newPost)
      }
      // 更新用户发帖数
      // if (userStore.user?.stats) {
      //   userStore.user.stats.postsCount++
      // }
    } catch (error) {
      throw error
    } finally {
      isPosting.value = false
    }
  }

  // 主页加载帖子
  async function fetchMorePosts() {
    if (isLoading.value || !hasMore.value) return

    try {
      isLoading.value = true

      const response = await apiGetPost(nextCursor.value)
      posts.value.push(...response.posts)
      console.log('postStore主页加载', posts.value)

      // 更新下一个游标
      nextCursor.value = response.nextCursor
      // 后端返回的nextCursor为null，则帖子全加载完了
      hasMore.value = response.nextCursor !== null
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 主页点赞帖子
  async function likePost(postId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('请先登录')
    }
    if (isLiking.value) return

    // 当前帖子
    const post = posts.value.find((p) => p._id === postId)
    if (!post) return

    // 记录原始状态
    const originalIsLiked = post.currentUserInteraction!.isLiked
    const originalLikesCount = post.stats.likesCount
    // 加载状态
    isLiking.value = true
    // 乐观更新UI
    post.stats.likesCount = originalLikesCount + (!originalIsLiked ? 1 : -1)
    post.currentUserInteraction!.isLiked = !originalIsLiked

    try {
      await apiLikePost(postId)
    } catch (error) {
      // 失败就回滚
      post.stats.likesCount = originalLikesCount
      post.currentUserInteraction!.isLiked = originalIsLiked
      throw error
    } finally {
      isLiking.value = false
    }
  }

  // 重置帖子状态
  function resetPosts() {
    posts.value = []
    nextCursor.value = null
    hasMore.value = true
  }

  return {
    posts,
    isPosting,
    isLoading,
    isLiking,
    createPost,
    fetchMorePosts,
    resetPosts,
    likePost,
    hasMore,
  }
})

export default usePostStore
