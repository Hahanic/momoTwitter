import jwt from 'jsonwebtoken'
import Post from '../db/model/Post.js'
import User from '../db/model/User.js'
import Like from '../db/model/Like.js'
import Bookmark from '../db/model/Bookmark.js'

// 发送帖子
export const createPost = async (req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: '用户未认证，请求被拒绝' })
  }
  try {
    // 解token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // 拿到作者Id
    const authorId = decoded.userId
    // 拿到帖子内容
    const { content, postType, media, parentPostId, quotedPostId, poll, visibility } = req.body
    // 数据本身有问题
    if (!content?.trim() || !postType) {
      return res.status(400).json({ message: '帖子内容和类型不能为空' })
    }
    // 根基Id找作者
    const author = await User.findById(authorId).select('username displayName avatarUrl isVerified')
    if (!author) {
      return res.status(404).json({ message: '未找到该用户' })
    }
    // 帖子本体
    const postData = {
      content,
      postType,
      authorId,
      authorInfo: {
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
        isVerified: author.isVerified,
      },
      media: media || [],
      visibility: visibility || 'public',
    }
    // 帖子类型
    switch (postType) {
      case 'standard':
        break
      case 'reply':
        if (!parentPostId) return res.status(400).json({ message: '回复帖必须提供 parentPostId' })
        postData.parentPostId = parentPostId
        await Post.findByIdAndUpdate(parentPostId, {
          $inc: { 'stats.repliesCount': 1 },
        })
        break
      case 'quote':
        if (!quotedPostId) return res.status(400).json({ message: '引用帖必须提供 quotedPostId' })
        postData.quotedPostId = quotedPostId
        await Post.findByIdAndUpdate(quotedPostId, {
          $inc: { 'stats.quotesCount': 1 },
        })
        break
      default:
        return res.status(400).json({ message: `无效的 postType: ${postType}` })
    }
    // 创建帖子实例
    const newPost = new Post(postData)
    await newPost.save()
    // 返回给前端的新帖子
    const responsePayload = {
      _id: newPost._id.toString(),
      content: newPost.content,
      postType: newPost.postType,
      media: newPost.media || [],
      createdAt: newPost.createdAt.toISOString(),
      authorInfo: newPost.authorInfo,
      stats: newPost.stats,
      currentUserInteraction: {
        isLiked: false,
        isBookmarked: false,
        isRetweeted: false,
      },
    }

    res.status(201).json(responsePayload)
  } catch (error) {
    // 如果 token 无效或过期，jwt.verify 会抛出错误
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token 无效或已过期' })
    }
    // 服务器内部错误
    console.error('创建帖子时发生错误:', error.message)
    res.status(500).json({ message: '服务器内部错误，请稍后再试' })
  }
}

// 获取全部帖子
export const getPost = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const cursor = req.query.cursor ? new Date(req.query.cursor) : null
    // 查询条件
    const query = {
      postType: { $in: ['standard', 'quote'] },
      visibility: 'public',
    }
    // 如果有游标，则加入时间条件
    if (cursor) {
      query.createdAt = { $lt: cursor }
    }
    // 查询帖子
    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).lean()
    // 计算下一个游标
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null

    // 如果用户已登录，返回带上交互信息
    const token = req.cookies.token
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const currentUserId = decoded.userId
      const postIds = posts.map((p) => p._id)

      const [userLikes, userBookmarks, userRetweets] = await Promise.all([
        // 查询点赞
        Like.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId'),
        // 查询收藏
        Bookmark.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId'),
        // 在 Post 集合中查找由当前用户创建的'retweet'记录
        Post.find({ authorId: currentUserId, postType: 'retweet', retweetedPostId: { $in: postIds } }).select(
          'retweetedPostId'
        ),
      ])

      const likedPostIds = new Set(userLikes.map((like) => like.postId.toString()))
      const bookmarkedPostIds = new Set(userBookmarks.map((bookmark) => bookmark.postId.toString()))
      const retweetedPostIds = new Set(userRetweets.map((retweet) => retweet.postId.toString()))

      const results = posts.map((post) => ({
        ...post,
        currentUserInteraction: {
          isLiked: likedPostIds.has(post._id.toString()),
          isBookmarked: bookmarkedPostIds.has(post._id.toString()),
          isRetweeted: retweetedPostIds.has(post._id.toString()),
        },
      }))

      return res.status(200).json({ posts: results, nextCursor })
    }

    // 如果用户没登录，直接返回帖子
    res.status(200).json({ posts, nextCursor })
  } catch (error) {
    // 如果 token 无效或过期，jwt.verify 会抛出错误
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token 无效或已过期' })
    }
    res.status(500).json({ message: '服务器内部错误，请稍后再试' })
  }
}

// 获取帖子的回复
export const getPostReplies = async (req, res) => {
  try {
    const { postId } = req.params
    const limit = parseInt(req.query.limit) || 10
    const cursor = req.query.cursor ? new Date(req.query.cursor) : null

    // 首先验证父帖子是否存在
    const parentPost = await Post.findById(postId)
    if (!parentPost) {
      return res.status(404).json({ message: '帖子不存在' })
    }

    // 查询回复条件
    const query = {
      postType: 'reply',
      parentPostId: postId,
      visibility: 'public',
    }

    // 如果有游标，则加入时间条件
    if (cursor) {
      query.createdAt = { $lt: cursor }
    }

    // 查询回复
    const replies = await Post.find(query).sort({ createdAt: -1 }).limit(limit).lean()

    // 计算下一个游标
    const nextCursor = replies.length > 0 ? replies[replies.length - 1].createdAt.toISOString() : null

    // 如果用户已登录，返回带上交互信息
    const token = req.cookies.token
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const currentUserId = decoded.userId
      const replyIds = replies.map((r) => r._id)

      const [userLikes, userBookmarks, userRetweets] = await Promise.all([
        Like.find({ userId: currentUserId, postId: { $in: replyIds } }).select('postId'),
        Bookmark.find({ userId: currentUserId, postId: { $in: replyIds } }).select('postId'),
        Post.find({
          authorId: currentUserId,
          postType: 'retweet',
          retweetedPostId: { $in: replyIds },
        }).select('retweetedPostId'),
      ])

      const likedPostIds = new Set(userLikes.map((like) => like.postId.toString()))
      const bookmarkedPostIds = new Set(userBookmarks.map((bookmark) => bookmark.postId.toString()))
      const retweetedPostIds = new Set(userRetweets.map((retweet) => retweet.retweetedPostId.toString()))

      const results = replies.map((reply) => ({
        ...reply,
        currentUserInteraction: {
          isLiked: likedPostIds.has(reply._id.toString()),
          isBookmarked: bookmarkedPostIds.has(reply._id.toString()),
          isRetweeted: retweetedPostIds.has(reply._id.toString()),
        },
      }))

      return res.status(200).json({ replies: results, nextCursor, parentPost })
    }

    // 如果用户没登录，直接返回回复
    res.status(200).json({ replies, nextCursor, parentPost })
  } catch (error) {
    console.error('获取帖子回复时发生错误:', error.message)
    res.status(500).json({ message: '服务器内部错误，请稍后再试' })
  }
}
