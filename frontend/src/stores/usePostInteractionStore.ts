import { defineStore } from 'pinia'
import { ref } from 'vue'

import usePostCacheStore from './usePostCacheStore.ts'
import useUserStore from './user.ts'

import { apiLikePost, apiBookmarkPost, apiCreateReply, createPost as apiCreatePost, apiViewPost } from '@/api/index.ts'
import type { CreatePostPayload } from '@/types'

const usePostInteractionStore = defineStore('postInteraction', () => {
  const postCacheStore = usePostCacheStore()
  const userStore = useUserStore()

  // 防止重复操作的状态跟踪
  const likingInProgress = ref(new Set<string>())
  const bookmarkingInProgress = ref(new Set<string>())
  const replyingInProgress = ref(new Set<string>())
  const postingInProgress = ref(false)

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
      await apiLikePost(postId)
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
      await apiBookmarkPost(postId)
      // const res = await apiBookmarkPost(postId)
      // console.log(res)
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
  async function createReply(parentPostId: string, content: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法回复')
    }

    if (replyingInProgress.value.has(parentPostId)) {
      throw new Error('正在回复中，请稍后再试')
    }

    const parentPost = postCacheStore.getPost(parentPostId)
    if (!parentPost) {
      throw new Error('父帖子不存在')
    }

    replyingInProgress.value.add(parentPostId)

    // 乐观更新父帖子的回复数
    const originalRepliesCount = parentPost.stats.repliesCount
    postCacheStore.updatePost(parentPostId, {
      stats: {
        ...parentPost.stats,
        repliesCount: originalRepliesCount + 1,
      },
    })

    try {
      const newReply = await apiCreateReply(parentPostId, content)

      // 将新回复添加到缓存
      postCacheStore.addPost(newReply)

      return newReply
    } catch (error) {
      // 失败回滚
      postCacheStore.updatePost(parentPostId, {
        stats: { ...parentPost.stats, repliesCount: originalRepliesCount },
      })

      throw error
    } finally {
      replyingInProgress.value.delete(parentPostId)
    }
  }

  // 创建新帖子
  async function createPost(payload: CreatePostPayload) {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录，无法发帖')
    }

    if (postingInProgress.value) {
      throw new Error('正在进行发帖操作，请稍后再试')
    }

    postingInProgress.value = true

    try {
      const newPost = await apiCreatePost(payload)

      // 将新帖子添加到缓存
      postCacheStore.addPost(newPost)

      return newPost
    } catch (error) {
      throw error
    } finally {
      postingInProgress.value = false
    }
  }

  // 浏览帖子
  async function viewPost(postId: string) {
    // if (!userStore.isAuthenticated) return
    const res = await apiViewPost(postId)
    postCacheStore.updatePost(postId, {
      stats: { ...res.stats },
    })
    return
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

  // 获取操作状态统计
  function getOperationStats() {
    return {
      likingCount: likingInProgress.value.size,
      bookmarkingCount: bookmarkingInProgress.value.size,
      replyingCount: replyingInProgress.value.size,
      isPosting: postingInProgress.value,
    }
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
    createReply,
    createPost,
    viewPost,

    // 状态检查方法
    isLikingPost,
    isBookmarkingPost,
    isReplyingToPost,
    isCreatingPost,

    // 工具方法
    getOperationStats,
    clearAllOperations,
  }
})

export default usePostInteractionStore
