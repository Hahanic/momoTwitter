import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import usePostCacheStore from './usePostCacheStore.ts'
import usePostInteractionStore from './usePostInteractionStore.ts'

import { getPostReplies as apiGetReplies } from '@/api'
import type { RecievePostPayload } from '@/types'

const usePostDetailStore = defineStore('postDetail', () => {
  const postCacheStore = usePostCacheStore()
  const interactionStore = usePostInteractionStore()

  // 当前详情页的帖子ID
  const currentPostId = ref<string | null>(null)

  // 父帖子链（从根帖子到当前帖子的父级，不包含当前帖子）
  const parentChain = ref<string[]>([])

  // 回复列表（只存储ID，实际数据从cache获取）
  const replyIds = ref<string[]>([])

  // 页面状态
  const isLoading = ref(false)
  const isLoadingReplies = ref(false)
  const isLoadingParentChain = ref(false)

  // 分页状态
  const repliesCursor = ref<string | null>(null)
  const hasMoreReplies = ref(true)

  // 计算属性：当前帖子
  const currentPost = computed(() => {
    return currentPostId.value ? postCacheStore.getPost(currentPostId.value) : null
  })

  // 计算属性：父帖子链（实际的帖子对象）
  const parentPosts = computed(() => {
    return parentChain.value.map((id) => postCacheStore.getPost(id)).filter(Boolean) as RecievePostPayload[]
  })

  // 计算属性：回复列表（实际的帖子对象）
  const replies = computed(() => {
    return replyIds.value.map((id) => postCacheStore.getPost(id)).filter(Boolean) as RecievePostPayload[]
  })

  // 加载帖子详情
  async function loadPostDetail(postId: string) {
    if (currentPostId.value === postId) {
      return // 已经加载了同一个帖子
    }
    isLoading.value = true

    try {
      // 重置状态
      resetState()
      currentPostId.value = postId

      // 确保当前帖子在缓存中
      await postCacheStore.fetchPostIfNotExists(postId)
      const post = postCacheStore.getPost(postId)

      if (!post) {
        throw new Error('无法加载帖子')
      }

      // 主帖子加载完成后立即设置 isLoading = false，让主帖子先渲染
      isLoading.value = false

      // 异步加载父帖子链和回复，不阻塞主帖子的渲染
      Promise.all([
        // 如果是回复帖子，构建父帖子链
        post.postType === 'reply' && post.parentPostId ? buildParentChain(post.parentPostId) : Promise.resolve(),
        // 加载回复
        loadReplies(),
      ]).catch((error) => {
        console.error('加载父帖子链或回复失败:', error)
      })
    } catch (error) {
      console.error('加载帖子详情失败:', error)
      isLoading.value = false
      throw error
    }
  }

  // 获取父帖子id和post列表
  async function getParentPosts(startParentId: string) {
    try {
      const chain: string[] = []
      const posts: RecievePostPayload[] = []
      let currentParentId: string | undefined = startParentId

      while (currentParentId) {
        const parentPost = await postCacheStore.fetchPostIfNotExists(currentParentId)
        chain.unshift(parentPost._id)
        posts.unshift(parentPost)
        currentParentId = parentPost.postType === 'reply' ? parentPost.parentPostId : undefined
      }
      return { chain, posts }
    } catch (error) {
      console.error('获取父帖子列表失败:', error)
      throw error
    }
  }

  // 构建父帖子链
  async function buildParentChain(startParentId: string) {
    if (isLoadingParentChain.value) return

    isLoadingParentChain.value = true

    try {
      const { chain } = await getParentPosts(startParentId)

      parentChain.value = chain
    } catch (error) {
      console.error('构建父帖子链失败:', error)
      throw error
    } finally {
      isLoadingParentChain.value = false
    }
  }

  // 加载回复
  async function loadReplies() {
    if (!currentPostId.value || isLoadingReplies.value || !hasMoreReplies.value) {
      return
    }

    isLoadingReplies.value = true

    try {
      const response = await apiGetReplies(currentPostId.value, repliesCursor.value)

      // 将回复添加到缓存
      postCacheStore.addPosts(response.replies)

      // 更新回复ID列表
      const newReplyIds = response.replies.map((reply) => reply._id)
      replyIds.value.push(...newReplyIds)

      // 更新分页信息
      repliesCursor.value = response.nextCursor
      hasMoreReplies.value = response.nextCursor !== null

      // 如果服务器返回了更新后的父帖子信息，更新缓存
      if (response.parentPost && currentPostId.value) {
        postCacheStore.updatePost(currentPostId.value, {
          stats: response.parentPost.stats,
        })
      }
    } catch (error) {
      console.error('加载回复失败:', error)
      throw error
    } finally {
      isLoadingReplies.value = false
    }
  }

  // 发送回复
  async function createReply(content: string, media?: { type: 'image' | 'video' | 'gif'; url: string }[]) {
    if (!currentPostId.value) {
      throw new Error('当前帖子不存在')
    }

    try {
      const newReply = await interactionStore.createReply({
        postType: 'reply',
        parentPostId: currentPostId.value,
        content,
        media,
      })

      // 将新回复添加到回复列表的开头
      replyIds.value.unshift(newReply._id)

      return newReply
    } catch (error) {
      throw error
    }
  }

  // 重置状态
  function resetState() {
    currentPostId.value = null
    parentChain.value = []
    replyIds.value = []
    repliesCursor.value = null
    hasMoreReplies.value = true
    isLoadingReplies.value = false
    isLoadingParentChain.value = false
  }

  return {
    // 状态
    currentPostId,
    isLoading,
    isLoadingReplies,
    isLoadingParentChain,
    hasMoreReplies,

    // 计算属性
    currentPost,
    parentPosts,
    replies,

    // 核心方法
    loadPostDetail,
    loadReplies,
    getParentPosts,
    createReply,
    resetState,
  }
})

export default usePostDetailStore
