import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  // 如果当前帖子是replay，那么就会有parentPost
  const parentPost = ref<RecievePostPayload | null>(null)
  // 父帖子链（从根帖子到当前帖子的父级，像栈一样）
  const parentChain = ref<RecievePostPayload[]>([])
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
  // 这个会在PostDetail页面加载以及路由route.params.postId变化时调用
  async function loadPostDetail(postId: string) {
    // 从postStore中找到当前帖子，这是从 主页 || 回复 进入的 (prettier规则表达式也换行了:)
    const foundPost =
      postStore.posts.find((post) => post._id === postId) || replies.value.find((reply) => reply._id === postId)
    if (foundPost) {
      currentPost.value = foundPost
    } else {
      // 如果没有找到帖子，从服务器加载，如果登录了就附带交互信息
      const response = await apiGetOnePost(postId)
      currentPost.value = response
    }

    // 重置回复相关状态
    replies.value = []
    repliesCursor.value = null
    hasMoreReplies.value = true
    parentPost.value = null // 重置父帖子
    parentChain.value = [] // 重置父帖子链

    // 如果是reply帖子，构建父帖子链
    if (currentPost.value?.postType === 'reply' && currentPost.value.parentPostId) {
      await buildParentChain(currentPost.value.parentPostId)
    }

    // 加载回复
    await loadReplies(postId)
  }

  // 构建父帖子链（从当前帖子往上追溯到根帖子）
  async function buildParentChain(startParentId: string) {
    const chain: RecievePostPayload[] = []
    let currentParentId: string | undefined = startParentId

    while (currentParentId) {
      // 首先尝试从本地缓存查找
      let parentPost = findPostInCache(currentParentId)

      if (!parentPost) {
        // 如果本地没有，从服务器获取
        try {
          parentPost = await apiGetOnePost(currentParentId)
        } catch (error) {
          console.error(`无法获取父帖子 ${currentParentId}:`, error)
          break
        }
      }

      // 将父帖子添加到链的开头（这样最终的顺序是从根帖子到直接父帖子）
      chain.unshift(parentPost)

      // 继续向上查找
      currentParentId = parentPost.postType === 'reply' ? parentPost.parentPostId : undefined
    }

    // 设置父帖子链和直接父帖子
    parentChain.value = chain
    parentPost.value = chain.length > 0 ? chain[chain.length - 1] : null
  }

  // 在缓存中查找帖子（postStore.posts 和 replies）
  function findPostInCache(postId: string): RecievePostPayload | undefined {
    // 在主帖子列表中查找
    const foundInPosts = postStore.posts.find((post) => post._id === postId)
    if (foundInPosts) return foundInPosts

    // 在当前回复列表中查找
    const foundInReplies = replies.value.find((reply) => reply._id === postId)
    if (foundInReplies) return foundInReplies

    // 在父帖子链中查找
    const foundInChain = parentChain.value.find((post) => post._id === postId)
    if (foundInChain) return foundInChain

    return undefined
  }

  // 设置父帖子（无需重新fetch，从现有数据中查找）
  function setParentPost(parentPostId: string) {
    const foundPost = findPostInCache(parentPostId)
    if (foundPost) {
      parentPost.value = foundPost
      return true
    }

    // 如果都没找到，parentPost保持为null
    parentPost.value = null
    return false
  }

  // 手动设置父帖子数据（用于从API获取后设置）
  function setParentPostData(post: RecievePostPayload) {
    parentPost.value = post
  }

  // 重置所有状态
  function resetState() {
    currentPost.value = null
    parentPost.value = null
    parentChain.value = []
    replies.value = []
    repliesCursor.value = null
    hasMoreReplies.value = true
    isLoadingReplies.value = false
    isReplying.value = false
  }

  // 检查当前是否为回复详情页（有父帖子的情况）
  const isReplyDetailView = computed(() => {
    return currentPost.value?.postType === 'reply' && parentChain.value.length > 0
  })

  // 获取根帖子（对话的起始帖子）
  const rootPost = computed(() => {
    return parentChain.value.length > 0 ? parentChain.value[0] : null
  })

  // 获取完整的对话链（从根帖子到当前帖子）
  const fullConversationChain = computed(() => {
    if (!currentPost.value) return []
    return [...parentChain.value, currentPost.value]
  })

  // 加载回复
  async function loadReplies(postId: string) {
    if (isLoadingReplies.value) return

    try {
      isLoadingReplies.value = true
      const response = await apiGetReplies(postId, repliesCursor.value)

      console.log('评论:', response)
      // 如果没有找到当前帖子，使用返回的parentPost
      // 这个挺重要的，就是在回复的回复发送reply时，更新currentPost的repliesCounts
      if (response.parentPost) {
        currentPost.value!.stats = response.parentPost.stats
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

  // 发送回复
  async function createReply(content: string) {
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
    // 状态
    currentPost,
    parentPost,
    parentChain,
    replies,
    isLoadingReplies,
    isReplying,
    repliesCursor,
    hasMoreReplies,
    // 计算属性
    isReplyDetailView,
    rootPost,
    fullConversationChain,
    // 方法
    loadPostDetail,
    loadReplies,
    buildParentChain,
    findPostInCache,
    setParentPost,
    setParentPostData,
    resetState,
    createReply,
    likeReply,
    likeCurrentPost,
  }
})

export default useReplyStore
