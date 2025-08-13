import Like from '../db/model/Like.js'
import Post from '../db/model/Post.js'
import { PostService } from '../services/postService.js'
import { verifyUserToken, parseCursor, sendResponse } from '../utils/index.js'

// 发送帖子
export const createPost = async (req, res) => {
  const authorId = req.user.id
  const { content, postType, media, parentPostId, quotedPostId, poll, visibility } = req.body

  // 数据验证
  if (!content?.trim() || !postType) {
    return sendResponse(res, 400, '帖子内容和类型不能为空')
  }

  // 获取作者信息
  const author = await PostService.getUserInfo(authorId)
  if (!author) {
    return sendResponse(res, 404, '未找到该用户')
  }

  // 创建基础帖子数据
  const postData = PostService.createPostData(content, postType, author, {
    media,
    visibility,
  })

  // 处理不同帖子类型
  switch (postType) {
    case 'standard':
      break
    case 'reply':
      if (!parentPostId) {
        return sendResponse(res, 400, '回复帖必须提供 parentPostId')
      }
      postData.parentPostId = parentPostId
      await PostService.updatePostStats(parentPostId, { 'stats.repliesCount': 1 })
      break
    case 'quote':
      if (!quotedPostId) {
        return sendResponse(res, 400, '引用帖必须提供 quotedPostId')
      }
      postData.quotedPostId = quotedPostId
      await PostService.updatePostStats(quotedPostId, { 'stats.quotesCount': 1 })
      break
    default:
      return sendResponse(res, 400, `无效的 postType: ${postType}`)
  }

  // 创建并保存帖子
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

  sendResponse(res, 201, '帖子创建成功', responsePayload)
}

// 获取单条帖子
export const getOnePost = async (req, res) => {
  const { postId } = req.params
  let post = await Post.findById(postId).lean()

  if (!post) {
    return sendResponse(res, 404, '帖子不存在')
  }

  // 如果用户已登录，添加交互信息
  const token = req.cookies.token
  if (token) {
    try {
      const currentUserId = verifyUserToken(token)
      if (currentUserId) {
        const interactions = await PostService.getUserInteractions(currentUserId, [postId])
        post = PostService.addUserInteractions([post], interactions)[0]
      }
    } catch (error) {
      // Token 错误时忽略，返回不带交互信息的帖子
    }
  }

  sendResponse(res, 200, '获取帖子成功', post)
}

// 获取全部帖子
export const getPost = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const cursor = parseCursor(req.query.cursor)

  // 查询条件
  const query = {
    postType: { $in: ['standard', 'quote'] },
    visibility: 'public',
  }

  if (cursor) {
    query.createdAt = { $lt: cursor }
  }

  // 查询帖子
  const posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit).lean()
  const nextCursor = posts.length < limit ? null : posts[posts.length - 1].createdAt.toISOString()

  let results = posts

  // 如果用户已登录，添加交互信息
  const token = req.cookies.token
  if (token && posts.length > 0) {
    try {
      const currentUserId = verifyUserToken(token)
      if (currentUserId) {
        const postIds = posts.map((p) => p._id)
        const interactions = await PostService.getUserInteractions(currentUserId, postIds)
        results = PostService.addUserInteractions(posts, interactions)
      }
    } catch (error) {
      // Token 错误时忽略，返回不带交互信息的帖子
    }
  }

  sendResponse(res, 200, '获取帖子列表成功', { posts: results, nextCursor })
}

// 获取帖子的回复
export const getPostReplies = async (req, res) => {
  const { postId } = req.params
  const limit = parseInt(req.query.limit) || 10
  const cursor = parseCursor(req.query.cursor)

  // 验证父帖子是否存在
  const parentPost = await Post.findById(postId)
  if (!parentPost) {
    return sendResponse(res, 404, '帖子不存在')
  }

  // 查询回复条件
  const query = {
    postType: 'reply',
    parentPostId: postId,
    visibility: 'public',
  }

  if (cursor) {
    query.createdAt = { $lt: cursor }
  }

  // 查询回复
  const replies = await Post.find(query).sort({ createdAt: -1 }).limit(limit).lean()
  const nextCursor = replies.length < limit ? null : replies[replies.length - 1].createdAt.toISOString()

  let results = replies

  // 如果用户已登录，添加交互信息
  const token = req.cookies.token
  if (token && replies.length > 0) {
    try {
      const currentUserId = verifyUserToken(token)
      if (currentUserId) {
        const replyIds = replies.map((r) => r._id)
        const interactions = await PostService.getUserInteractions(currentUserId, replyIds)
        results = PostService.addUserInteractions(replies, interactions)
      }
    } catch (error) {
      // Token 错误时忽略
    }
  }

  sendResponse(res, 200, '获取回复成功', { replies: results, nextCursor, parentPost })
}

// 发送帖子回复
export const createPostReply = async (req, res) => {
  const { postId } = req.params
  const { content } = req.body
  const currentUserId = req.user.id

  // 验证帖子是否存在
  const parentPost = await Post.findById(postId)
  if (!parentPost) {
    return sendResponse(res, 404, '帖子不存在')
  }

  // 获取作者信息
  const author = await PostService.getUserInfo(currentUserId)

  // 创建回复
  const newReply = new Post({
    content,
    postType: 'reply',
    parentPostId: postId,
    authorId: currentUserId,
    authorInfo: {
      username: author.username,
      displayName: author.displayName,
      avatarUrl: author.avatarUrl,
      isVerified: author.isVerified,
    },
  })

  await newReply.save()
  await PostService.updatePostStats(postId, { 'stats.repliesCount': 1 })

  const responseData = {
    ...newReply.toObject(),
    currentUserInteraction: {
      isLiked: false,
      isBookmarked: false,
      isRetweeted: false,
    },
  }

  sendResponse(res, 201, '回复成功', responseData)
}

// 点赞
export const likePost = async (req, res) => {
  const { postId } = req.params
  const currentUserId = req.user.id

  // 验证帖子是否存在
  const post = await Post.findById(postId)
  if (!post) {
    return sendResponse(res, 404, '帖子不存在')
  }

  // 检查用户是否已经点赞过这个帖子
  const existingLike = await Like.findOne({ userId: currentUserId, postId })

  if (existingLike) {
    // 取消点赞
    await Like.deleteOne({ userId: currentUserId, postId })
    await PostService.updatePostStats(postId, { 'stats.likesCount': -1 })

    sendResponse(res, 200, '取消点赞成功', {
      isLiked: false,
      likesCount: post.stats.likesCount - 1,
    })
  } else {
    // 添加点赞
    const newLike = new Like({ userId: currentUserId, postId })
    await newLike.save()
    await PostService.updatePostStats(postId, { 'stats.likesCount': 1 })

    sendResponse(res, 200, '点赞成功', {
      isLiked: true,
      likesCount: post.stats.likesCount + 1,
    })
  }
}
