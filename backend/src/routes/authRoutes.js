import express from 'express'
const router = express.Router()

import {
  getIdentifyingCode,
  getCurrentUser,
  updateUserProfile,
  refreshAccessToken,
  register,
  login,
  logout,
  followUser,
  unfollowUser,
} from '../controller/auth.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { validateRegister, validateLogin } from '../middleware/validation.js'

// 注册
router.post('/register', validateRegister, asyncHandler(register))
// 登录
router.post('/login', validateLogin, asyncHandler(login))
// 登出
router.post('/logout', asyncHandler(logout))
// 获取AccessToken
router.post('/refresh-token', asyncHandler(refreshAccessToken))
// 获取当前登录用户信息
router.get('/me', protectAuthRoute, asyncHandler(getCurrentUser))
// 更新用户信息
router.put('/me', protectAuthRoute, asyncHandler(updateUserProfile))
// 获取登录验证码
router.get('/captcha', getIdentifyingCode)
// 关注用户
router.post('/:username/follow', protectAuthRoute, asyncHandler(followUser))
// 取消关注用户
router.delete('/:username/follow', protectAuthRoute, asyncHandler(unfollowUser))

export default router
