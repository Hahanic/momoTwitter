import Bookmark from '../db/model/Bookmark.js'
import Like from '../db/model/Like.js'
import Post from '../db/model/Post.js'
import { PostService } from '../services/postService.js'
import { verifyUserToken, parseCursor, sendResponse } from '../utils/index.js'

// 发送帖子
export const createPost = async (req, res) => {
  const authorId = req.user.id
  const { content, postType, media, parentPostId, quotedPostId, visibility } = req.body

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

      // 验证父帖子是否存在
      const parentPost = await Post.findById(parentPostId)
      if (!parentPost) {
        return sendResponse(res, 404, '父帖子不存在')
      }

      postData.parentPostId = parentPostId
      await PostService.updateAncestorRepliesCount(parentPostId, 1)
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
    ...newPost.toObject(),
    currentUserInteraction: {
      isLiked: false,
      isBookmarked: false,
      isRetweeted: false,
    },
  }

  sendResponse(res, 201, '成功', { newPost: responsePayload })
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

// 获取帖子的parentPost
export const getReplyParentPost = async (req, res) => {
  const { postId } = req.params // 修正参数名
  const MAX_DEPTH = 10 // 防止无限递归的最大深度

  // 验证本回复是否存在
  const reply = await Post.findById(postId).lean()
  if (!reply) {
    return sendResponse(res, 404, '回复不存在')
  }

  // 验证是否为回复类型且有parentPostId
  if (reply.postType !== 'reply' || !reply.parentPostId) {
    return sendResponse(res, 404, '父帖子不存在')
  }

  // 获取所有祖先帖子ID
  const ancestorIds = []
  let currentParentId = reply.parentPostId
  let depth = 0

  // 收集所有祖先ID
  while (currentParentId && depth < MAX_DEPTH) {
    ancestorIds.push(currentParentId)

    // 查找当前父帖子的父帖子ID
    const parentPost = await Post.findById(currentParentId).select('parentPostId').lean()
    if (!parentPost) {
      break
    }

    currentParentId = parentPost.parentPostId
    depth++
  }

  if (ancestorIds.length === 0) {
    return sendResponse(res, 200, '获取父帖子成功', [])
  }

  // 一次性查询所有祖先帖子
  const ancestorPosts = await Post.find({
    _id: { $in: ancestorIds },
    visibility: 'public',
  }).lean()

  // 按照从最近到最远的顺序排序
  const ancestorsMap = new Map(ancestorPosts.map((post) => [post._id.toString(), post]))
  const ancestors = ancestorIds.map((id) => ancestorsMap.get(id.toString())).filter(Boolean) // 过滤掉不存在或不可见的帖子

  // 如果用户登录了，添加交互信息
  const token = req.cookies.token
  let resultParentPosts = ancestors

  if (token && ancestors.length > 0) {
    try {
      const currentUserId = verifyUserToken(token)
      if (currentUserId) {
        const postIds = ancestors.map((p) => p._id)
        const interactions = await PostService.getUserInteractions(currentUserId, postIds)
        resultParentPosts = PostService.addUserInteractions(ancestors, interactions)
      }
    } catch (error) {
      // Token 错误时忽略，返回不带交互信息的帖子
    }
  }

  sendResponse(res, 200, '获取父帖子成功', { resultParentPosts })
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

// 收藏帖子
export const bookmarkPost = async (req, res) => {
  const { postId } = req.params
  const currentUserId = req.user.id

  // 验证帖子是否存在
  const post = await Post.findById(postId)
  if (!post) {
    return sendResponse(res, 404, '帖子不存在')
  }

  // 检查用户是否已经收藏过这个帖子
  const existingBookmark = await Bookmark.findOne({ userId: currentUserId, postId })

  if (existingBookmark) {
    // 取消收藏
    await Bookmark.deleteOne({ userId: currentUserId, postId })
    await PostService.updatePostStats(postId, { 'stats.bookmarksCount': -1 })

    sendResponse(res, 200, '取消收藏成功', {
      isBookmarked: false,
      bookmarksCount: post.stats.bookmarksCount - 1,
    })
  } else {
    // 添加收藏
    const newBookmark = new Bookmark({ userId: currentUserId, postId })
    await newBookmark.save()
    await PostService.updatePostStats(postId, { 'stats.bookmarksCount': 1 })

    sendResponse(res, 200, '收藏成功', {
      isBookmarked: true,
      bookmarksCount: post.stats.bookmarksCount + 1,
    })
  }
}

// 浏览数
export const viewPost = async (req, res) => {
  const { postId } = req.params

  // 验证帖子是否存在
  const post = await Post.findById(postId)
  if (!post) return

  // 增加浏览数
  const currentPost = await PostService.updatePostStats(postId, { 'stats.viewsCount': 1 })
  const stats = currentPost.stats
  sendResponse(res, 200, 'true', { stats })
}
