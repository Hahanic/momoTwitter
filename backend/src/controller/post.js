import Post from '../db/model/Post.js'
import User from '../db/model/User.js'
import Like from '../db/model/Like.js'
import Bookmark from '../db/model/Bookmark.js'
import { verifyUserToken, parseCursor } from '../utils/index.js'

// 获取用户交互信息
const getUserInteractions = async (currentUserId, postIds) => {
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
  const retweetedPostIds = new Set(userRetweets.map((retweet) => retweet.retweetedPostId.toString()))

  return { likedPostIds, bookmarkedPostIds, retweetedPostIds }
}

// 为帖子添加用户交互信息
const addUserInteractions = (posts, interactions) => {
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

// 发送帖子
export const createPost = async (req, res) => {
  try {
    // 验证token并获取用户ID
    const authorId = req.user.id

    // 拿到帖子内容
    const { content, postType, media, parentPostId, quotedPostId, poll, visibility } = req.body

    // 数据本身有问题
    if (!content?.trim() || !postType) {
      return res.status(400).json({ message: '帖子内容和类型不能为空' })
    }

    // 根据Id找作者
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
    res.status(500).json({ message: '服务器内部错误，请稍后再试' })
  }
}

// 获取全部帖子
export const getPost = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const cursor = parseCursor(req.query.cursor)
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
    const nextCursor = posts.length < limit ? null : posts[posts.length - 1].createdAt.toISOString()
    // 如果用户已登录，返回带上交互信息
    const token = req.cookies.token
    let results = posts

    if (token) {
      const currentUserId = verifyUserToken(token)
      if (currentUserId && posts.length > 0) {
        const postIds = posts.map((p) => p._id)
        const interactions = await getUserInteractions(currentUserId, postIds)
        results = addUserInteractions(posts, interactions)
      }
    }

    res.status(200).json({ posts: results, nextCursor })
  } catch (error) {
    if (error.message === 'Token 无效或已过期') {
      return res.status(401).json({ message: error.message })
    }
    if (error.message === '无效的游标格式') {
      return res.status(400).json({ message: error.message })
    }
    console.error('获取帖子时发生错误:', error.message)
    res.status(500).json({ message: '服务器内部错误，请稍后再试' })
  }
}

// 获取帖子的回复
export const getPostReplies = async (req, res) => {
  try {
    const { postId } = req.params
    const limit = parseInt(req.query.limit) || 10
    const cursor = parseCursor(req.query.cursor)
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
    const nextCursor = replies.length < limit ? null : replies[replies.length - 1].createdAt.toISOString()
    // 如果用户已登录，返回带上交互信息
    const token = req.cookies.token
    let results = replies

    if (token) {
      const currentUserId = verifyUserToken(token)
      if (currentUserId && replies.length > 0) {
        const replyIds = replies.map((r) => r._id)
        const interactions = await getUserInteractions(currentUserId, replyIds)
        results = addUserInteractions(replies, interactions)
      }
    }

    res.status(200).json({ replies: results, nextCursor, parentPost })
  } catch (error) {
    if (error.message === 'Token 无效或已过期') {
      return res.status(401).json({ message: error.message })
    }
    if (error.message === '无效的游标格式') {
      return res.status(400).json({ message: error.message })
    }
    console.error('获取帖子回复时发生错误:', error.message)
    res.status(500).json({ message: '服务器内部错误，请稍后再试' })
  }
}

// 发送帖子回复
export const createPostReply = async (req, res) => {
  try {
    const { postId } = req.params
    const { content } = req.body
    const currentUserId = req.user.id

    // 验证帖子是否存在
    const parentPost = await Post.findById(postId)
    if (!parentPost) {
      return res.status(404).json({ message: '帖子不存在' })
    }
    // 创建回复
    const newReply = new Post({
      content,
      postType: 'reply',
      parentPostId: postId,
      authorId: currentUserId,
      authorInfo: await User.findById(currentUserId).select('username displayName avatarUrl isVerified'),
    })
    await newReply.save()
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { 'stats.repliesCount': 1 } }
      //{ new: true }, 选项将返回更新后的文档
    )
    res.status(201).json(newReply)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '服务器内部错误，请稍后再试' })
  }
}

// 点赞
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params
    const currentUserId = req.user.id

    // 验证帖子是否存在
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' })
    }

    // 检查用户是否已经点赞过这个帖子
    const existingLike = await Like.findOne({ userId: currentUserId, postId })

    if (existingLike) {
      // 如果已经点赞，则取消点赞
      await Like.deleteOne({ userId: currentUserId, postId })
      await Post.findByIdAndUpdate(postId, {
        $inc: { 'stats.likesCount': -1 },
      })
      res.status(200).json({
        message: '取消点赞成功',
        isLiked: false,
        likesCount: post.stats.likesCount - 1,
      })
    } else {
      // 如果没有点赞，则添加点赞
      const newLike = new Like({ userId: currentUserId, postId })
      await newLike.save()
      await Post.findByIdAndUpdate(postId, {
        $inc: { 'stats.likesCount': 1 },
      })
      res.status(200).json({
        message: '点赞成功',
        isLiked: true,
        likesCount: post.stats.likesCount + 1,
      })
    }
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误，请稍后再试' })
  }
}
