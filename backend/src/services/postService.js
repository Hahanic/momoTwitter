import Bookmark from '../db/model/Bookmark.js'
import Like from '../db/model/Like.js'
import Post from '../db/model/Post.js'
import User from '../db/model/User.js'
import { verifyUserToken } from '../utils/index.js'

export class PostService {
  // 获取用户交互信息
  static async getUserInteractions(currentUserId, postIds) {
    const [userLikes, userBookmarks, userRetweets] = await Promise.all([
      Like.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId'),
      Bookmark.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId'),
      Post.find({
        authorId: currentUserId,
        postType: 'retweet',
        retweetedPostId: { $in: postIds },
      }).select('retweetedPostId'),
    ])

    return {
      likedPostIds: new Set(userLikes.map((like) => like.postId.toString())),
      bookmarkedPostIds: new Set(userBookmarks.map((bookmark) => bookmark.postId.toString())),
      retweetedPostIds: new Set(userRetweets.map((retweet) => retweet.retweetedPostId.toString())),
    }
  }

  // 为帖子添加用户交互信息
  static addUserInteractions(posts, interactions) {
    const { likedPostIds, bookmarkedPostIds, retweetedPostIds } = interactions

    return posts.map((post) => ({
      ...post,
      currentUserInteraction: {
        isLiked: likedPostIds.has(post._id.toString()),
        isBookmarked: bookmarkedPostIds.has(post._id.toString()),
        isRetweeted: retweetedPostIds.has(post._id.toString()),
      },
    }))
  }

  // 获取用户信息
  static async getUserInfo(userId) {
    return await User.findById(userId).select('username displayName avatarUrl isVerified')
  }

  // 创建帖子数据结构
  static createPostData(content, postType, authorInfo, options = {}) {
    return {
      content,
      postType,
      authorId: authorInfo._id,
      authorInfo: {
        username: authorInfo.username,
        displayName: authorInfo.displayName,
        avatarUrl: authorInfo.avatarUrl,
        isVerified: authorInfo.isVerified,
      },
      media: options.media || [],
      visibility: options.visibility || 'public',
      ...options.additionalData,
    }
  }

  // 更新帖子统计
  static async updatePostStats(postId, updates) {
    return await Post.findByIdAndUpdate(postId, { $inc: updates })
  }

  // 更新所有祖先帖子的回复统计
  static async updateAncestorRepliesCount(postId, increment = 1) {
    const ancestorIds = []
    let currentParentId = postId

    // 收集所有祖先帖子ID
    while (currentParentId) {
      const parentPost = await Post.findById(currentParentId).select('parentPostId').lean()
      if (!parentPost) {
        break
      }

      ancestorIds.push(currentParentId)
      currentParentId = parentPost.parentPostId
    }

    // 批量更新所有祖先帖子的回复统计
    if (ancestorIds.length > 0) {
      await Post.updateMany({ _id: { $in: ancestorIds } }, { $inc: { 'stats.repliesCount': increment } })
    }

    return ancestorIds
  }

  // 更新用户统计信息
  static async updateUserStats(userId, updates) {
    const result = await User.findByIdAndUpdate(
      userId,
      { $inc: updates },
      {
        new: true,
        runValidators: true,
      }
    )

    return result
  }

  // ============ 用户主页分类流 ============
  static async fetchUserPosts(userId, cursorDate, limit) {
    const query = {
      authorId: userId,
      postType: { $in: ['standard', 'quote'] },
      visibility: 'public',
    }
    if (cursorDate) query.createdAt = { $lt: cursorDate }
    const rows = await Post.find(query).sort({ createdAt: -1 }).limit(limit).lean()
    const nextCursor = rows.length === limit ? rows[rows.length - 1].createdAt.toISOString() : null
    return { posts: rows, nextCursor }
  }

  static async fetchUserReplies(userId, cursorDate, limit) {
    const query = {
      authorId: userId,
      postType: { $in: ['reply'] },
      visibility: 'public',
    }
    if (cursorDate) query.createdAt = { $lt: cursorDate }
    const rows = await Post.find(query).sort({ createdAt: -1 }).limit(limit).lean()
    const nextCursor = rows.length === limit ? rows[rows.length - 1].createdAt.toISOString() : null
    return { posts: rows, nextCursor }
  }

  static async fetchUserLikes(userId, cursorDate, limit) {
    const likeQuery = { userId }
    if (cursorDate) likeQuery.createdAt = { $lt: cursorDate }
    const likes = await Like.find(likeQuery).sort({ createdAt: -1 }).limit(limit).lean()
    const likedIds = likes.map((l) => l.postId)
    let posts = []
    if (likedIds.length) {
      const likedPosts = await Post.find({ _id: { $in: likedIds }, visibility: 'public' }).lean()
      const map = new Map(likedPosts.map((p) => [p._id.toString(), p]))
      posts = likes.map((l) => map.get(l.postId.toString())).filter(Boolean)
    }
    const nextCursor = likes.length === limit ? likes[likes.length - 1].createdAt.toISOString() : null
    return { posts, nextCursor }
  }

  static async fetchUserBookmarks(userId, cursorDate, limit) {
    const bookmarkQuery = { userId }
    if (cursorDate) bookmarkQuery.createdAt = { $lt: cursorDate }
    const bookmarks = await Bookmark.find(bookmarkQuery).sort({ createdAt: -1 }).limit(limit).lean()
    const ids = bookmarks.map((b) => b.postId)
    let posts = []
    if (ids.length) {
      const rows = await Post.find({ _id: { $in: ids }, visibility: 'public' }).lean()
      const map = new Map(rows.map((p) => [p._id.toString(), p]))
      posts = bookmarks.map((b) => map.get(b.postId.toString())).filter(Boolean)
    }
    const nextCursor = bookmarks.length === limit ? bookmarks[bookmarks.length - 1].createdAt.toISOString() : null
    return { posts, nextCursor }
  }

  static async decorateWithInteractionsIfNeeded(req, posts) {
    if (!posts.length) return posts
    const token = req.cookies.token
    if (!token) return posts
    try {
      const currentUserId = verifyUserToken(token)
      if (!currentUserId) return posts
      const ids = posts.map((p) => p._id).filter(Boolean)
      if (!ids.length) return posts
      const interactions = await PostService.getUserInteractions(currentUserId, ids)
      return PostService.addUserInteractions(posts, interactions)
    } catch {
      return posts
    }
  }
}
