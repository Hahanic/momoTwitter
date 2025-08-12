import express from 'express'
const router = express.Router()

import { getIdentifyingCode, getCurrentUser, register, login, logout } from '../controller/auth.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// api/user

// 获取/更新用户信息
router.get('/getCurrentUser', protectAuthRoute, asyncHandler(getCurrentUser))
// 注册
router.post('/register', asyncHandler(register))
// 登录
router.post('/login', asyncHandler(login))
// 登出
router.post('/logout', asyncHandler(logout))
// 获取登录验证码
router.get('/getIdentifyingCode', getIdentifyingCode)

export default router
