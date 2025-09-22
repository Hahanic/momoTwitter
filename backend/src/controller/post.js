import Bookmark from '../db/model/Bookmark.js'
import Like from '../db/model/Like.js'
import Post from '../db/model/Post.js'
import Relationship from '../db/model/Relationship.js'
import Retweet from '../db/model/Retweet.js'
import User from '../db/model/User.js'
import { translateText } from '../services/aiService.js'
import { PostService } from '../services/postService.js'
import { parseCursor, sendResponse, verifyAccessToken } from '../utils/index.js'

// 发送帖子
export const createPost = async (req, res) => {
  const authorId = req.user.id
  const { content, postType, media, parentPostId, quotedPostId, retweetedPostId, visibility } = req.body
  // 数据验证
  if (!media && !postType && !content?.trim()) {
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

  // 用户postCount++
  await PostService.updateUserStats(authorId, { 'stats.postsCount': 1 })

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
  const accessToken = req.headers.authorization?.split(' ')[1]
  if (accessToken) {
    try {
      const currentUserId = verifyAccessToken(accessToken)
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
  const limit = parseInt(req.query.limit) || 20
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

  // 将帖子包装为时间线项（与 getFollowingPosts 保持一致）
  const timelineItems = posts.map((post) => ({
    type: 'post',
    timestamp: post.createdAt,
    data: post,
  }))

  // 如果用户已登录，添加交互信息（仅作用于 data 部分）
  let finalTimeline = timelineItems
  if (posts.length > 0) {
    try {
      const decoratedPosts = await PostService.decorateWithInteractionsIfNeeded(req, posts)
      finalTimeline = timelineItems.map((item, index) => ({
        ...item,
        data: decoratedPosts[index],
      }))
    } catch (error) {
      // 忽略交互装饰错误，保持原数据
    }
  }

  sendResponse(res, 200, '获取帖子列表成功', { posts: finalTimeline, nextCursor })
}

// 获取帖子的回复
export const getPostReplies = async (req, res) => {
  const { postId } = req.params
  const limit = parseInt(req.query.limit) || 20
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
  const accessToken = req.headers.authorization?.split(' ')[1]
  if (accessToken && replies.length > 0) {
    try {
      const currentUserId = verifyAccessToken(accessToken)
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
  const MAX_DEPTH = 20 // 防止无限递归的最大深度

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
  const accessToken = req.headers.authorization?.split(' ')[1]
  let resultParentPosts = ancestors

  if (accessToken && ancestors.length > 0) {
    try {
      const currentUserId = verifyAccessToken(accessToken)
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
// 转推
export const retweetPost = async (req, res) => {
  const { postId } = req.params
  const currentUserId = req.user.id

  // 1. 验证帖子是否存在
  const post = await Post.findById(postId)
  if (!post) {
    return sendResponse(res, 404, '帖子不存在')
  }

  // 2. 检查用户是否已经转推过这个帖子
  const existingRetweet = await Retweet.findOne({ userId: currentUserId, postId })

  if (existingRetweet) {
    // 3. 如果已经转推过，则取消转推
    await Retweet.deleteOne({ _id: existingRetweet._id })

    // 更新原帖的转推数
    const updatedPost = await PostService.updatePostStats(postId, { 'stats.retweetsCount': -1 })
    // 更新用户的转推数
    await PostService.updateUserStats(currentUserId, { 'stats.retweetsCount': -1 })

    sendResponse(res, 200, '取消转推成功', {
      isRetweeted: false,
      retweetsCount: updatedPost.stats.retweetsCount,
    })
  } else {
    // 4. 如果没有转推过，则创建新转推
    const newRetweet = new Retweet({ userId: currentUserId, postId })
    await newRetweet.save()

    // 更新原帖的转推数
    const updatedPost = await PostService.updatePostStats(postId, { 'stats.retweetsCount': 1 })
    // 更新用户的转推数
    await PostService.updateUserStats(currentUserId, { 'stats.retweetsCount': 1 })

    sendResponse(res, 200, '转推成功', {
      isRetweeted: true,
      retweetsCount: updatedPost.stats.retweetsCount,
    })
  }
} // 浏览数
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

// 获取某用户主页的帖子
export const getUserCategoryPosts = async (req, res) => {
  const { username } = req.params
  const category = req.query.category || 'posts'
  const limit = Math.min(parseInt(req.query.limit) || 20, 50)
  const cursorDate = parseCursor(req.query.cursor)

  const user = await User.findOne({ username })
  if (!user) return sendResponse(res, 404, '用户不存在')

  const strategy = {
    posts: PostService.fetchUserPosts,
    replies: PostService.fetchUserReplies,
    likes: PostService.fetchUserLikes,
    bookmarks: PostService.fetchUserBookmarks,
  }
  const fetcher = strategy[category]
  if (!fetcher) return sendResponse(res, 400, '无效的分类')

  try {
    const { posts, nextCursor } = await fetcher(user._id, cursorDate, limit)
    const decorated = await PostService.decorateWithInteractionsIfNeeded(req, posts)

    return sendResponse(res, 200, '获取用户帖子成功', { posts: decorated, nextCursor })
  } catch (e) {
    return sendResponse(res, 500, '获取用户帖子失败', { error: e.message })
  }
}

export const translatePost = async (req, res) => {
  const { postId } = req.params
  let ToLanguage = req.body?.targetLanguage || 'zh-CN'

  try {
    const post = await Post.findById(postId)
    if (!post) {
      return sendResponse(res, 404, '帖子不存在')
    }

    if (!post.content || !post.content.trim()) {
      return sendResponse(res, 400, '帖子没有可翻译的内容')
    }

    const translatedContent = await translateText(post.content, ToLanguage)
    sendResponse(res, 200, '翻译成功', { translatedContent, language: ToLanguage })
  } catch (error) {
    sendResponse(res, 500, '翻译失败', { error: error.message })
  }
}

export const deletePost = async (req, res) => {
  const { postId } = req.params
  const currentUserId = req.user.id

  // 验证帖子是否存在
  const post = await Post.findById(postId)
  if (!post) {
    return sendResponse(res, 404, '帖子不存在')
  }

  // 检查当前用户是否是帖子作者
  if (post.authorId.toString() !== currentUserId) {
    return sendResponse(res, 403, '你没有权限删除此帖子')
  }

  // 计算需删除的所有帖子ID（根 + 所有层级回复）
  const descendantIds = await PostService.getDescendantReplyIds(postId)
  const toDeleteIds = [post._id, ...descendantIds]

  // 统计每位作者将被删除的帖子数量，用于同步维护 users.stats.postsCount
  const postsToRemove = await Post.find({ _id: { $in: toDeleteIds } })
    .select('authorId')
    .lean()
  const authorDeleteCountMap = new Map()
  for (const p of postsToRemove) {
    const key = p.authorId.toString()
    authorDeleteCountMap.set(key, (authorDeleteCountMap.get(key) || 0) + 1)
  }

  // 清理关联的点赞和收藏
  await Promise.all([
    Like.deleteMany({ postId: { $in: toDeleteIds } }),
    Bookmark.deleteMany({ postId: { $in: toDeleteIds } }),
  ])

  // 批量删除帖子
  await Post.deleteMany({ _id: { $in: toDeleteIds } })

  // 批量更新被影响用户的 postsCount
  if (authorDeleteCountMap.size > 0) {
    const ops = Array.from(authorDeleteCountMap.entries()).map(([userId, cnt]) => ({
      updateOne: {
        filter: { _id: userId },
        update: { $inc: { 'stats.postsCount': -cnt } },
      },
    }))
    await User.bulkWrite(ops)
  }

  // 如果删除的是回复，需让所有祖先帖子的 repliesCount 同步减少（根回复 + 其所有层级子回复都会计入祖先统计）
  if (post.postType === 'reply' && post.parentPostId) {
    await PostService.updateAncestorRepliesCount(post.parentPostId, -toDeleteIds.length)
  }

  return sendResponse(res, 200, '删除成功', { deletedCount: toDeleteIds.length })
}

// 搜索帖子
export const searchPosts = async (req, res) => {
  const { q } = req.query
  const page = parseInt(req.query.page, 10) || 1
  const limit = Math.min(parseInt(req.query.limit) || 10, 20)

  if (!q || !q.trim()) {
    return sendResponse(res, 400, '搜索关键词不能为空')
  }

  try {
    const { posts, hasMore } = await PostService.searchPosts(q.trim(), page, limit)
    const decorated = await PostService.decorateWithInteractionsIfNeeded(req, posts)
    return sendResponse(res, 200, '搜索成功', { posts: decorated, hasMore })
  } catch (error) {
    return sendResponse(res, 500, '搜索失败', { error: error.message })
  }
}

// 获取用户关注的用户的帖子
export const getFollowingPosts = async (req, res) => {
  const currentUserId = req.user.id
  const limit = Math.min(parseInt(req.query.limit) || 10, 20)
  const cursor = parseCursor(req.query.cursor)

  // 1. 查找当前用户关注的所有用户ID
  const followList = await Relationship.find({ followerId: currentUserId }).lean()
  const followingIds = followList.map((item) => item.followingId).filter(Boolean)

  // 将用户自己也加入，以便在时间线上看到自己的帖子和转推
  const timelineUserIds = [...new Set([currentUserId, ...followingIds])]

  // 如果只关注了自己且没有其他人，可以提前返回空
  if (timelineUserIds.length === 1 && timelineUserIds[0] === currentUserId && followingIds.length === 0) {
    // 如果用户没有关注任何人，可以根据产品逻辑决定是否显示自己的帖子
    // 这里我们暂时返回空，因为通常关注流只显示关注者的内容
    return sendResponse(res, 200, '没有关注任何用户', { posts: [], nextCursor: null })
  }

  // 2. 为 Post 和 Retweet 分别构建查询条件
  const postQuery = {
    authorId: { $in: timelineUserIds },
    postType: { $in: ['standard', 'quote'] },
    visibility: 'public',
  }
  if (cursor) {
    postQuery.createdAt = { $lt: cursor }
  }

  const retweetQuery = {
    userId: { $in: timelineUserIds },
  }
  if (cursor) {
    retweetQuery.createdAt = { $lt: cursor }
  }

  // 3. 并行获取帖子和转推
  const [postsFromFollowing, retweetsFromFollowing] = await Promise.all([
    Post.find(postQuery).sort({ createdAt: -1 }).limit(limit).lean(),
    Retweet.find(retweetQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'postId',
        model: 'Post',
        // 确保填充被引用帖子的作者信息
        populate: { path: 'authorInfo' },
      })
      .populate({
        path: 'userId',
        model: 'User',
        select: 'username displayName avatarUrl isVerified',
      })
      .lean(),
  ])

  // 4. 格式化并合并
  const timelineItems = [
    ...postsFromFollowing.map((post) => ({
      type: 'post',
      timestamp: post.createdAt,
      data: post,
    })),
    ...retweetsFromFollowing
      .filter((retweet) => retweet.postId) // 过滤掉可能已被删除的原帖
      .map((retweet) => ({
        type: 'retweet',
        timestamp: retweet.createdAt,
        retweetedBy: retweet.userId,
        data: retweet.postId, // postId 已经被 populate 填充
      })),
  ]

  // 5. 按时间戳排序并分页
  timelineItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const paginatedItems = timelineItems.slice(0, limit)

  // 6. 确定下一个游标
  const nextCursor =
    paginatedItems.length < limit ? null : paginatedItems[paginatedItems.length - 1].timestamp.toISOString()

  // 7. 添加交互信息
  if (paginatedItems.length > 0) {
    const postsOnly = paginatedItems.map((item) => item.data)
    const decoratedPosts = await PostService.decorateWithInteractionsIfNeeded(req, postsOnly)

    const finalTimeline = paginatedItems.map((item, index) => ({
      ...item,
      data: decoratedPosts[index],
    }))

    return sendResponse(res, 200, '获取关注用户的帖子成功', { posts: finalTimeline, nextCursor })
  }

  sendResponse(res, 200, '获取关注用户的帖子成功', { posts: [], nextCursor: null })
}
