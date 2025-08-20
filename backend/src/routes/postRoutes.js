import express from 'express'
const router = express.Router()

import {
  createPost,
  getPost,
  getPostReplies,
  likePost,
  bookmarkPost,
  viewPost,
  getOnePost,
  getReplyParentPost,
  getUserCategoryPosts,
} from '../controller/post.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// api/post

// 主页加载帖子
router.get('/getPost', asyncHandler(getPost))
// 获取单条帖子
router.get('/:postId/get', asyncHandler(getOnePost))
// 获取回复
router.get('/:postId/replies', asyncHandler(getPostReplies))
// 获取父帖子
router.get('/:postId/parent', asyncHandler(getReplyParentPost))
// 新建帖子和回复
router.post('/create', protectAuthRoute, asyncHandler(createPost))
// 新建回复
// router.post('/:postId/replies', protectAuthRoute, asyncHandler(createPostReply))
// 点赞帖子/回复
router.post('/:postId/like', protectAuthRoute, asyncHandler(likePost))
// 收藏帖子/回复
router.post('/:postId/bookmark', protectAuthRoute, asyncHandler(bookmarkPost))
// 增加帖子浏览数
router.post('/:postId/view', viewPost)
// 获取某用户主页的帖子
router.get('/:username/category', asyncHandler(getUserCategoryPosts))

export default router
