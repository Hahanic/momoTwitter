import { defineStore } from 'pinia'
import { ref } from 'vue'

import usePostCacheStore from './usePostCacheStore.ts'
import useUserStore from './userUserStore.ts'

import { likePost, bookmarkPost, createPost, recordPostView, translatePost, deletePost } from '@/api/index.ts'
import type { CreatePostPayload } from '@/types'

const usePostInteractionStore = defineStore('postInteraction', () => {
  const postCacheStore = usePostCacheStore()
  const userStore = useUserStore()

  // 存储已经翻译的帖子ID和目标语言和内容
  const translatedPosts = ref<Map<string, { language: string; translatedContent: string }>>(new Map())

  const operationInProgress = ref<Map<string, Set<string>>>(
    new Map([
      ['liking', new Set<string>()],
      ['bookmarking', new Set<string>()],
      ['replying', new Set<string>()],
      ['posting', new Set<string>()],
      ['translating', new Set<string>()],
    ])
  )

  // 点赞/取消点赞
  async function toggleLike(postId: string) {
    const post = postCacheStore.getPost(postId)
    if (!post) {
      throw new Error('帖子不存在')
    }
    if (!post.currentUserInteraction || !userStore.isAuthenticated) {
      throw new Error('未登录')
    }
    const original = {
      isLiked: post.currentUserInteraction.isLiked,
      isBookmarked: post.currentUserInteraction.isBookmarked,
      isRetweeted: post.currentUserInteraction.isRetweeted,
      likesCount: post.stats.likesCount,
    }
    return withOptimisticUpdate({
      operationType: 'liking',
      entityId: postId,
      apiCall: () => likePost(postId),
      optimisticUpdateFn: () => {
        postCacheStore.updatePost(postId, {
          stats: {
            ...post.stats,
            likesCount: original.likesCount + (!original.isLiked ? 1 : -1),
          },
          currentUserInteraction: {
            isLiked: !original.isLiked,
            isBookmarked: original.isBookmarked,
            isRetweeted: original.isRetweeted,
          },
        })
      },
      rollbackFn: () => {
        postCacheStore.updatePost(postId, {
          stats: { ...post.stats, likesCount: original.likesCount },
          currentUserInteraction: {
            isLiked: original.isLiked,
            isBookmarked: original.isBookmarked,
            isRetweeted: original.isRetweeted,
          },
        })
      },
    })
  }

  // 收藏/取消收藏 (目前只做乐观更新，等后端API)
  async function toggleBookmark(postId: string) {
    const post = postCacheStore.getPost(postId)
    if (!post) throw new Error('帖子不存在')
    if (!post.currentUserInteraction || !userStore.isAuthenticated) {
      throw new Error('未登录')
    }
    const original = {
      isLiked: post.currentUserInteraction.isLiked,
      isBookmarked: post.currentUserInteraction.isBookmarked,
      isRetweeted: post.currentUserInteraction.isRetweeted,
      bookmarksCount: post.stats.bookmarksCount,
    }
    return withOptimisticUpdate({
      operationType: 'bookmarking',
      entityId: postId,
      apiCall: () => bookmarkPost(postId),
      optimisticUpdateFn: () => {
        postCacheStore.updatePost(postId, {
          stats: {
            ...post.stats,
            bookmarksCount: original.bookmarksCount + (!original.isBookmarked ? 1 : -1),
          },
          currentUserInteraction: {
            isLiked: original.isLiked,
            isBookmarked: !original.isBookmarked,
            isRetweeted: original.isRetweeted,
          },
        })
      },
      rollbackFn: () => {
        postCacheStore.updatePost(postId, {
          stats: { ...post.stats, bookmarksCount: original.bookmarksCount },
          currentUserInteraction: {
            isLiked: original.isLiked,
            isBookmarked: original.isBookmarked,
            isRetweeted: original.isRetweeted,
          },
        })
      },
    })
  }

  // 转发/取消转发
  async function toggleRetweet(postId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法转发')
    }

    const post = postCacheStore.getPost(postId)
    if (!post || !post.currentUserInteraction) {
      throw new Error('帖子不存在')
    }

    const originalIsRetweeted = post.currentUserInteraction.isRetweeted

    // 乐观更新
    postCacheStore.updatePost(postId, {
      currentUserInteraction: {
        ...post.currentUserInteraction,
        isRetweeted: !originalIsRetweeted,
      },
    })

    try {
      // TODO: 等待后端实现转发API
      // await apiRetweetPost(postId)
      console.log('转发功能待实现')
    } catch (error) {
      // 失败回滚
      postCacheStore.updatePost(postId, {
        currentUserInteraction: {
          ...post.currentUserInteraction,
          isRetweeted: originalIsRetweeted,
        },
      })

      throw error
    }
  }

  // 回复
  async function handleCreateReply(payload: CreatePostPayload) {
    if (!payload.parentPostId) {
      throw new Error('缺少父帖子ID')
    }
    const parentPost = postCacheStore.getPost(payload.parentPostId)
    if (!parentPost) {
      throw new Error('父帖子不存在')
    }
    const originalRepliesCount = parentPost.stats.repliesCount
    return withOptimisticUpdate({
      operationType: 'replying',
      entityId: payload.parentPostId,
      apiCall: async () => {
        const newReply = await createPost({ ...payload, postType: 'reply' })
        postCacheStore.addPost(newReply.newPost)
        return newReply.newPost
      },
      optimisticUpdateFn: () => {
        postCacheStore.updatePost(payload.parentPostId!, {
          stats: {
            ...parentPost.stats,
            repliesCount: originalRepliesCount + 1,
          },
        })
      },
      rollbackFn: () => {
        postCacheStore.updatePost(payload.parentPostId!, {
          stats: { ...parentPost.stats, repliesCount: originalRepliesCount },
        })
      },
    })
  }
  // 创建新帖子
  async function handleCreatePost(payload: CreatePostPayload) {
    return withOptimisticUpdate({
      operationType: 'posting',
      entityId: 'global',
      apiCall: async () => {
        const res = await createPost(payload)
        postCacheStore.addPost(res.newPost)
        return res.newPost
      },
      optimisticUpdateFn: () => {},
      rollbackFn: () => {},
    })
  }

  // 浏览帖子
  async function viewPost(postId: string) {
    // if (!userStore.isAuthenticated) return
    const res = await recordPostView(postId)
    postCacheStore.updatePost(postId, {
      stats: { ...res.stats },
    })
    return
  }

  // 删除帖子
  async function handleDeletePost(postId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法删除帖子')
    }
    const post = postCacheStore.getPost(postId)
    if (!post) {
      throw new Error('帖子不存在')
    }
    if (post.authorInfo.username !== userStore.user?.username) {
      throw new Error('只能删除自己的帖子')
    }
    try {
      const res = await deletePost(postId)
      if (res.deletedCount > 0) {
        postCacheStore.removePost(postId)
      }
      return res
    } catch (error) {
      console.error('删除帖子失败:', error)
      throw error
    }
  }

  // 翻译帖子
  async function handleTranslatePost(postId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法翻译帖子')
    }
    if (operationInProgress.value.get('translating')?.has(postId)) {
      throw new Error('翻译操作已在进行中，请稍后再试')
    }
    const currentLocale = localStorage.getItem('locale') || 'zh-CN'
    operationInProgress.value.get('translating')?.add(postId)
    try {
      const oldTranslation = translatedPosts.value.get(postId)
      if (oldTranslation && oldTranslation.language === currentLocale) {
        return oldTranslation
      }
      const res = await translatePost(postId, currentLocale)
      translatedPosts.value.set(postId, { language: res.language, translatedContent: res.translatedContent })
      return res
    } catch (error) {
      console.error('翻译帖子失败:', error)
    } finally {
      operationInProgress.value.get('translating')?.delete(postId)
    }
  }

  // 检查是否正在进行某个操作
  function isLikingPost(postId: string): boolean {
    return operationInProgress.value.get('liking')?.has(postId) ?? false
  }

  function isBookmarkingPost(postId: string): boolean {
    return operationInProgress.value.get('bookmarking')?.has(postId) ?? false
  }

  function isReplyingToPost(postId: string): boolean {
    return operationInProgress.value.get('replying')?.has(postId) ?? false
  }

  function isCreatingPost(): boolean {
    return operationInProgress.value.get('posting')?.has('global') ?? false
  }

  function isTranslatingPost(postId: string): boolean {
    return operationInProgress.value.get('translating')?.has(postId) ?? false
  }

  // 清除所有操作状态（用于重置或错误恢复）
  function clearAllOperations() {
    for (const set of operationInProgress.value.values()) {
      set.clear()
    }
  }

  async function withOptimisticUpdate<T>({
    operationType,
    entityId,
    apiCall,
    optimisticUpdateFn,
    rollbackFn,
  }: {
    operationType: 'liking' | 'bookmarking' | 'replying' | 'posting' | 'translating'
    entityId?: string
    apiCall: () => Promise<T>
    optimisticUpdateFn: () => void
    rollbackFn: () => void
  }) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法进行此操作')
    }
    if (!entityId || !operationInProgress.value.has(operationType)) {
      throw new Error('无效的操作类型或帖子不存在')
    }
    operationInProgress.value.get(operationType)?.add(entityId)
    // 乐观更新
    optimisticUpdateFn()
    try {
      return await apiCall()
    } catch (error) {
      rollbackFn()
      throw error
    } finally {
      operationInProgress.value.get(operationType)?.delete(entityId)
    }
  }

  return {
    // 核心交互方法
    toggleLike,
    toggleBookmark,
    toggleRetweet,
    handleTranslatePost,
    handleCreateReply,
    handleCreatePost,
    handleDeletePost,
    viewPost,

    // state
    translatedPosts,

    // 状态检查方法
    isLikingPost,
    isBookmarkingPost,
    isReplyingToPost,
    isCreatingPost,
    isTranslatingPost,

    // 工具方法
    clearAllOperations,
  }
})

export default usePostInteractionStore
