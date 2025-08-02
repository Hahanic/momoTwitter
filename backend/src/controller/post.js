import jwt from 'jsonwebtoken'
import Post from '../db/model/Post.js'
import User from '../db/model/User.js'

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
    const {
      content,
      postType,
      media,
      parentPostId,
      quotedPostId,
      poll,
      visibility
    } = req.body
    // 数据本身有问题
    if (!content?.trim() || !postType) {
      return res.status(400).json({ message: "帖子内容和类型不能为空" })
    }
    // 根基Id找作者
    const author = await User.findById(authorId).select('username displayName avatarUrl isVerified')
    if (!author) {
      return res.status(404).json({ message: "未找到该用户" })
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
        if (!parentPostId) return res.status(400).json({ message: "回复帖必须提供 parentPostId" });
        postData.parentPostId = parentPostId;
        await Post.findByIdAndUpdate(parentPostId, { $inc: { 'stats.repliesCount': 1 } });
        break;
      case 'quote':
        if (!quotedPostId) return res.status(400).json({ message: "引用帖必须提供 quotedPostId" });
        postData.quotedPostId = quotedPostId;
        await Post.findByIdAndUpdate(quotedPostId, { $inc: { 'stats.quotesCount': 1 } });
        break;
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
      }
    }

    res.status(201).json(responsePayload)

  } catch (error) {
    // 如果 token 无效或过期，jwt.verify 会抛出错误
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token 无效或已过期" });
    }
    // 服务器内部错误
    console.error("创建帖子时发生错误:", error);
    res.status(500).json({ message: "服务器内部错误，请稍后再试" });
  }
}