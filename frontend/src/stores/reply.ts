import { defineStore } from 'pinia'
import { ref } from 'vue'

import usePostStore from './post'
import useUserStore from './user'

import { getPostReplies as apiGetReplies, apiCreateReply, apiLikePost, apiGetOnePost } from '@/api'
import { type RecievePostPayload } from '@/types'

const useReplyStore = defineStore('reply', () => {
  const postStore = usePostStore()
  const userStore = useUserStore()

  //评论的点赞状态
  const isLiking = ref(false)

  // 当前帖子数据
  const currentPost = ref<RecievePostPayload | null>(null)
  // 回复列表
  const replies = ref<RecievePostPayload[]>([])
  // 加载状态
  const isLoadingReplies = ref(false)
  // 发送状态
  const isReplying = ref(false)
  // 分页游标
  const repliesCursor = ref<string | null>(null)
  // 是否还有更多回复
  const hasMoreReplies = ref(true)

  // 获取帖子详情
  const loadPostDetail = async (postId: string) => {
    // 重置回复相关状态
    replies.value = []
    repliesCursor.value = null
    hasMoreReplies.value = true

    // 从postStore中找到当前帖子
    const foundPost = postStore.posts.find((post) => post._id === postId)
    if (foundPost) {
      currentPost.value = foundPost
    } else {
      // 如果没有找到帖子，从服务器加载，如果登录了就附带交互信息
      const response = await apiGetOnePost(postId)
      currentPost.value = response
    }
    // 加载回复
    await loadReplies(postId)
  }

  // 发送回复
  const createReply = async (content: string) => {
    if (!currentPost.value) return

    try {
      isReplying.value = true
      const response = await apiCreateReply(currentPost.value._id, content)
      // 更新当前帖子的回复计数
      currentPost.value.stats.repliesCount++
      // 追加回复到列表
      replies.value.unshift(response)
    } catch (error) {
      throw error
    } finally {
      isReplying.value = false
    }
  }

  // 加载回复
  const loadReplies = async (postId: string) => {
    if (isLoadingReplies.value) return

    try {
      isLoadingReplies.value = true
      const response = await apiGetReplies(postId, repliesCursor.value)

      console.log('评论:', response)
      // 如果没有找到当前帖子，使用返回的parentPost
      if (!currentPost.value && response.parentPost) {
        currentPost.value = response.parentPost
      }
      // 追加回复到列表
      replies.value.push(...response.replies)
      // 更新游标和是否还有更多数据
      repliesCursor.value = response.nextCursor
      hasMoreReplies.value = response.nextCursor !== null
    } catch (error) {
      throw error
    } finally {
      isLoadingReplies.value = false
    }
  }

  // 点赞当前帖子，从起一个是因为在Detail页面刷新会导致postStore里的posts被重置
  const likeCurrentPost = async () => {
    if (!userStore.isAuthenticated) {
      throw new Error('请先登录')
    }
    if (isLiking.value) return

    // 当前帖子
    const post = currentPost.value
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
      await apiLikePost(post._id)
    } catch (error) {
      // 失败就回滚
      post.stats.likesCount = originalLikesCount
      post.currentUserInteraction!.isLiked = originalIsLiked
      throw error
    } finally {
      isLiking.value = false
    }
  }

  // 点赞回复
  async function likeReply(replyId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('请先登录')
    }
    if (isLiking.value) return

    // 当前评论
    const reply = replies.value.find((r) => r._id === replyId)
    if (!reply) return

    // 记录原始状态
    const originalIsLiked = reply.currentUserInteraction!.isLiked
    const originalLikesCount = reply.stats.likesCount
    // 加载状态
    isLiking.value = true
    // 乐观更新UI
    reply.stats.likesCount = originalLikesCount + (!originalIsLiked ? 1 : -1)
    reply.currentUserInteraction!.isLiked = !originalIsLiked

    try {
      await apiLikePost(replyId)
    } catch (error) {
      // 失败就回滚
      reply.stats.likesCount = originalLikesCount
      reply.currentUserInteraction!.isLiked = originalIsLiked
      throw error
    } finally {
      isLiking.value = false
    }
  }

  return {
    currentPost,
    replies,
    isLoadingReplies,
    isReplying,
    repliesCursor,
    hasMoreReplies,
    loadPostDetail,
    loadReplies,
    createReply,
    likeReply,
    likeCurrentPost,
  }
})

export default useReplyStore
