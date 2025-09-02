import { defineStore } from 'pinia'
import { ref } from 'vue'

import usePostCacheStore from './usePostCacheStore.ts'
import useUserStore from './userUserStore.ts'

import { likePost, bookmarkPost, createPost, recordPostView, translatePost } from '@/api/index.ts'
import type { CreatePostPayload } from '@/types'

const usePostInteractionStore = defineStore('postInteraction', () => {
  const postCacheStore = usePostCacheStore()
  const userStore = useUserStore()

  // 存储已经翻译的帖子ID和目标语言和内容
  const translatedPosts = ref<Map<string, { language: string; translatedContent: string }>>(new Map())

  // 防止重复操作的状态跟踪
  const likingInProgress = ref(new Set<string>())
  const bookmarkingInProgress = ref(new Set<string>())
  const replyingInProgress = ref(new Set<string>())
  const postingInProgress = ref(false)
  const translatingInProgress = ref(false)

  // 点赞/取消点赞
  async function toggleLike(postId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法点赞')
    }

    if (likingInProgress.value.has(postId)) {
      throw new Error('点赞进行中，请稍后再试')
    }

    const post = postCacheStore.getPost(postId)
    if (!post || !post.currentUserInteraction) {
      throw new Error('帖子不存在')
    }

    // 记录原始状态
    const originalIsLiked = post.currentUserInteraction.isLiked
    const originalLikesCount = post.stats.likesCount

    likingInProgress.value.add(postId)

    // 乐观更新
    postCacheStore.updatePost(postId, {
      stats: {
        ...post.stats,
        likesCount: originalLikesCount + (!originalIsLiked ? 1 : -1),
      },
      currentUserInteraction: {
        ...post.currentUserInteraction,
        isLiked: !originalIsLiked,
      },
    })

    try {
      await likePost(postId)
    } catch (error) {
      // 失败回滚
      postCacheStore.updatePost(postId, {
        stats: { ...post.stats, likesCount: originalLikesCount },
        currentUserInteraction: { ...post.currentUserInteraction, isLiked: originalIsLiked },
      })

      throw error
    } finally {
      likingInProgress.value.delete(postId)
    }
  }

  // 收藏/取消收藏 (目前只做乐观更新，等后端API)
  async function toggleBookmark(postId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法收藏')
    }

    if (bookmarkingInProgress.value.has(postId)) {
      throw new Error('收藏进行中，请稍后再试')
    }

    const post = postCacheStore.getPost(postId)
    if (!post || !post.currentUserInteraction) {
      throw new Error('帖子不存在')
    }

    const originalIsBookmarked = post.currentUserInteraction.isBookmarked
    const originalBookmarksCount = post.stats.bookmarksCount

    bookmarkingInProgress.value.add(postId)

    // 乐观更新
    postCacheStore.updatePost(postId, {
      stats: {
        ...post.stats,
        bookmarksCount: originalBookmarksCount + (!originalIsBookmarked ? 1 : -1),
      },
      currentUserInteraction: {
        ...post.currentUserInteraction,
        isBookmarked: !originalIsBookmarked,
      },
    })

    try {
      await bookmarkPost(postId)
    } catch (error) {
      // 失败回滚
      postCacheStore.updatePost(postId, {
        stats: { ...post.stats, bookmarksCount: originalBookmarksCount },
        currentUserInteraction: {
          ...post.currentUserInteraction,
          isBookmarked: originalIsBookmarked,
        },
      })

      throw error
    } finally {
      bookmarkingInProgress.value.delete(postId)
    }
  }

  // 转发 (目前只做乐观更新，等后端API)
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
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法回复')
    }

    if (!payload.parentPostId) {
      throw new Error('缺少父帖子ID')
    }

    if (replyingInProgress.value.has(payload.parentPostId)) {
      throw new Error('正在回复中，请稍后再试')
    }

    const parentPost = postCacheStore.getPost(payload.parentPostId)
    if (!parentPost) {
      throw new Error('父帖子不存在')
    }

    replyingInProgress.value.add(payload.parentPostId)

    // 乐观更新父帖子的回复数
    const originalRepliesCount = parentPost.stats.repliesCount
    postCacheStore.updatePost(payload.parentPostId, {
      stats: {
        ...parentPost.stats,
        repliesCount: originalRepliesCount + 1,
      },
    })

    try {
      const newReply = await createPost({ ...payload, postType: 'reply' })
      // 将新回复添加到缓存
      postCacheStore.addPost(newReply.newPost)

      return newReply.newPost
    } catch (error) {
      // 失败回滚
      postCacheStore.updatePost(payload.parentPostId, {
        stats: { ...parentPost.stats, repliesCount: originalRepliesCount },
      })

      throw error
    } finally {
      replyingInProgress.value.delete(payload.parentPostId)
    }
  }

  // 创建新帖子
  async function handleCreatePost(payload: CreatePostPayload) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法发帖')
    }

    if (postingInProgress.value) {
      throw new Error('正在进行发帖操作，请稍后再试')
    }

    postingInProgress.value = true

    try {
      const res = await createPost(payload)

      // 将新帖子添加到缓存
      postCacheStore.addPost(res.newPost)

      return res.newPost
    } catch (error) {
      throw error
    } finally {
      postingInProgress.value = false
    }
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

  // 翻译帖子
  async function handleTranslatePost(postId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法翻译帖子')
    }
    if (translatingInProgress.value) {
      throw new Error('翻译操作已在进行中，请稍后再试')
    }

    const currentLocale = localStorage.getItem('locale') || 'zh-CN'

    try {
      translatingInProgress.value = true

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
      translatingInProgress.value = false
    }
  }

  // 检查是否正在进行某个操作
  function isLikingPost(postId: string): boolean {
    return likingInProgress.value.has(postId)
  }

  function isBookmarkingPost(postId: string): boolean {
    return bookmarkingInProgress.value.has(postId)
  }

  function isReplyingToPost(postId: string): boolean {
    return replyingInProgress.value.has(postId)
  }

  function isCreatingPost(): boolean {
    return postingInProgress.value
  }

  function isTranslatingPost(): boolean {
    return translatingInProgress.value
  }

  // 清除所有操作状态（用于重置或错误恢复）
  function clearAllOperations() {
    likingInProgress.value.clear()
    bookmarkingInProgress.value.clear()
    replyingInProgress.value.clear()
    postingInProgress.value = false
  }

  return {
    // 核心交互方法
    toggleLike,
    toggleBookmark,
    toggleRetweet,
    handleTranslatePost,
    handleCreateReply,
    handleCreatePost,
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
