import express from 'express'
const router = express.Router()

import { getUserProfile, getUserFollowing, getUserFollowers } from '../controller/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// 获取用户主页信息
router.get('/:username', asyncHandler(getUserProfile))
// 获取关注列表
router.get('/:username/following', asyncHandler(getUserFollowing))
// 获取粉丝列表
router.get('/:username/followers', asyncHandler(getUserFollowers))

export default router
