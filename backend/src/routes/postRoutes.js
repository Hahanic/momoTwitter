import express from 'express'
const router = express.Router()

import { createPost, createPostReply, getPost, getPostReplies, likePost, getOnePost } from '../controller/post.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// api/post

// 主页加载帖子
router.get('/getPost', asyncHandler(getPost))
// 获取单条帖子
router.get('/:postId/get', asyncHandler(getOnePost))
// 获取回复
router.get('/:postId/replies', asyncHandler(getPostReplies))
// 新建帖子
router.post('/create', protectAuthRoute, asyncHandler(createPost))
// 新建回复
router.post('/:postId/replies', protectAuthRoute, asyncHandler(createPostReply))
// 点赞帖子/回复
router.post('/:postId/like', protectAuthRoute, asyncHandler(likePost))

export default router
