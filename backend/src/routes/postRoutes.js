import express from 'express'
const router = express.Router()

import {
  createPost,
  getPost,
  deletePost,
  getPostReplies,
  likePost,
  bookmarkPost,
  viewPost,
  getOnePost,
  getReplyParentPost,
  getUserCategoryPosts,
  translatePost,
} from '../controller/post.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// 主页加载帖子
router.get('/', asyncHandler(getPost))
// 新建帖子和回复
router.post('/', protectAuthRoute, asyncHandler(createPost))
// 获取单条帖子
router.get('/:postId', asyncHandler(getOnePost))
// 删除帖子/回复
router.delete('/:postId', protectAuthRoute, asyncHandler(deletePost))
// 获取回复
router.get('/:postId/replies', asyncHandler(getPostReplies))
// 获取父帖子
router.get('/:postId/parent', asyncHandler(getReplyParentPost))
// 点赞帖子/回复
router.post('/:postId/likes', protectAuthRoute, asyncHandler(likePost))
// 收藏帖子
router.post('/:postId/bookmarks', protectAuthRoute, asyncHandler(bookmarkPost))
// 增加帖子浏览数
router.post('/:postId/views', viewPost)
// 获取某用户主页的帖子
router.get('/:username/category', asyncHandler(getUserCategoryPosts))
// 翻译帖子
router.post('/:postId/translate', asyncHandler(translatePost))

export default router
