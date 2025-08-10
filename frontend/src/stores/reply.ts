import { ref } from 'vue'
import { defineStore } from 'pinia'
import { type RecievePostPayload } from '@/types'
import { getPostReplies as apiGetReplies } from '@/api'
import usePostStore from './post'

const useReplyStore = defineStore('reply', () => {
  const postStore = usePostStore()

  // 当前帖子数据
  const currentPost = ref<RecievePostPayload | null>(null)
  // 回复列表
  const replies = ref<RecievePostPayload[]>([])
  // 加载状态
  const isLoadingReplies = ref(false)
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

    // 首先尝试从store中找到当前帖子
    const foundPost = postStore.posts.find((post) => post._id === postId)
    if (foundPost) {
      currentPost.value = foundPost
    }
    // 加载回复
    await loadReplies(postId)
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
  return {
    currentPost,
    replies,
    isLoadingReplies,
    repliesCursor,
    hasMoreReplies,
    loadPostDetail,
    loadReplies,
  }
})

export default useReplyStore
