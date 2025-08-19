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

  // 计算属性：直接父帖子
  const parentPost = computed(() => {
    const posts = parentPosts.value
    return posts.length > 0 ? posts[posts.length - 1] : null
  })

  // 计算属性：根帖子
  const rootPost = computed(() => {
    const posts = parentPosts.value
    return posts.length > 0 ? posts[0] : null
  })

  // 计算属性：完整对话链（从根帖子到当前帖子）
  const fullConversationChain = computed(() => {
    const conversation = [...parentPosts.value]
    if (currentPost.value) {
      conversation.push(currentPost.value)
    }
    return conversation
  })

  // 计算属性：回复列表（实际的帖子对象）
  const replies = computed(() => {
    return replyIds.value.map((id) => postCacheStore.getPost(id)).filter(Boolean) as RecievePostPayload[]
  })

  // 计算属性：是否为回复详情页
  const isReplyDetailView = computed(() => {
    return currentPost.value?.postType === 'reply' && parentChain.value.length > 0
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

  // 构建父帖子链
  async function buildParentChain(startParentId: string) {
    if (isLoadingParentChain.value) return

    isLoadingParentChain.value = true

    try {
      // 从当前帖子往上追溯到根帖子
      const chain: string[] = []
      let currentParentId: string | undefined = startParentId

      while (currentParentId) {
        // 确保父帖子在缓存中
        const parentPost = await postCacheStore.fetchPostIfNotExists(currentParentId)

        // 将父帖子ID添加到链的开头（这样最终顺序是从根帖子到直接父帖子）
        chain.unshift(parentPost._id)

        // 继续向上查找
        currentParentId = parentPost.postType === 'reply' ? parentPost.parentPostId : undefined
      }

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
  async function createReply(content: string) {
    if (!currentPostId.value) {
      throw new Error('当前帖子不存在')
    }

    try {
      const newReply = await interactionStore.createReply(currentPostId.value, content)

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

  // 刷新当前帖子详情
  async function refreshPostDetail() {
    if (currentPostId.value) {
      // 清除缓存中的当前帖子和回复
      const allIds = [currentPostId.value, ...parentChain.value, ...replyIds.value]
      postCacheStore.removePosts(allIds)

      // 重新加载
      await loadPostDetail(currentPostId.value)
    }
  }

  // 检查帖子是否在当前对话中
  function isPostInCurrentConversation(postId: string): boolean {
    return currentPostId.value === postId || parentChain.value.includes(postId) || replyIds.value.includes(postId)
  }

  // 获取帖子在对话中的位置
  function getPostPositionInConversation(postId: string): 'current' | 'parent' | 'reply' | 'none' {
    if (currentPostId.value === postId) return 'current'
    if (parentChain.value.includes(postId)) return 'parent'
    if (replyIds.value.includes(postId)) return 'reply'
    return 'none'
  }

  // 导航到对话中的其他帖子
  async function navigateToPostInConversation(postId: string) {
    if (isPostInCurrentConversation(postId)) {
      await loadPostDetail(postId)
    } else {
      throw new Error('帖子不在当前对话中')
    }
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
    parentPost,
    rootPost,
    parentPosts,
    replies,
    fullConversationChain,
    isReplyDetailView,

    // 核心方法
    loadPostDetail,
    loadReplies,
    createReply,
    resetState,
    refreshPostDetail,

    // 工具方法
    isPostInCurrentConversation,
    getPostPositionInConversation,
    navigateToPostInConversation,
  }
})

export default usePostDetailStore
