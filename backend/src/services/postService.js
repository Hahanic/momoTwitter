import Bookmark from '../db/model/Bookmark.js'
import Like from '../db/model/Like.js'
import Post from '../db/model/Post.js'
import User from '../db/model/User.js'

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
}
