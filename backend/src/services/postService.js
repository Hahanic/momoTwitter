import Bookmark from '../db/model/Bookmark.js'
import Like from '../db/model/Like.js'
import Post from '../db/model/Post.js'
import Retweet from '../db/model/Retweet.js'
import User from '../db/model/User.js'
import { verifyAccessToken } from '../utils/index.js'

export class PostService {
  // 获取某个帖子下所有层级的回复ID（不包含根本身）
  static async getDescendantReplyIds(rootPostId) {
    const queue = [rootPostId]
    const allIds = []

    while (queue.length) {
      const batch = await Post.find({ parentPostId: { $in: queue }, postType: 'reply' })
        .select('_id')
        .lean()
      if (!batch.length) break
      const childIds = batch.map((d) => d._id)
      allIds.push(...childIds)

      // 准备下一层
      queue.length = 0
      queue.push(...childIds)
    }

    return allIds
  }
  // 获取用户交互信息
  static async getUserInteractions(currentUserId, postIds) {
    const [userLikes, userBookmarks, userRetweets] = await Promise.all([
      Like.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId'),
      Bookmark.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId'),
      Retweet.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId'),
    ])

    return {
      likedPostIds: new Set(userLikes.map((like) => like.postId.toString())),
      bookmarkedPostIds: new Set(userBookmarks.map((bookmark) => bookmark.postId.toString())),
      retweetedPostIds: new Set(userRetweets.map((retweet) => retweet.postId.toString())),
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
    return await Post.findByIdAndUpdate(postId, { $inc: updates }, { new: true })
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

  // 搜索帖子
  static async searchPosts(query, page, limit) {
    const skip = (page - 1) * limit

    // 解析搜索查询
    const searchFilter = await this.parseSearchQuery(query)

    // 使用解析后的过滤条件搜索帖子
    const posts = await Post.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1) // 多获取一条数据来判断是否还有下一页
      .lean()

    let hasMore = false
    if (posts.length > limit) {
      hasMore = true
      posts.pop()
    }

    return { posts, hasMore }
  }

  // 解析搜索查询语法
  static async parseSearchQuery(query) {
    // 检查是否是 from:username:keyword 格式
    const fromMatch = query.match(/^from:([^:]+):(.+)$/)

    if (fromMatch) {
      const [, username, keyword] = fromMatch

      // 查找用户
      const user = await User.findOne({ username: username.trim() }).select('_id').lean()
      if (!user) {
        // 如果用户不存在，返回一个不会匹配到任何帖子的查询
        return { _id: null }
      }

      // 转义关键词中的特殊字符
      const escapedKeyword = keyword.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

      return {
        authorId: user._id,
        content: { $regex: escapedKeyword, $options: 'i' },
        visibility: 'public',
      }
    }

    // 检查是否是 from:username 格式（只搜索用户的所有帖子）
    const fromOnlyMatch = query.match(/^from:([^:]+)$/)

    if (fromOnlyMatch) {
      const username = fromOnlyMatch[1].trim()

      // 查找用户
      const user = await User.findOne({ username }).select('_id').lean()
      if (!user) {
        return { _id: null }
      }

      return {
        authorId: user._id,
        visibility: 'public',
      }
    }

    // 在所有帖子的内容中搜索
    const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

    return {
      content: { $regex: escapedQuery, $options: 'i' },
      visibility: 'public',
    }
  }

  // 用户主页分类流
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
    const accessToken = req.headers.authorization?.split(' ')[1]
    if (!accessToken) return posts
    try {
      const currentUserId = verifyAccessToken(accessToken)
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
