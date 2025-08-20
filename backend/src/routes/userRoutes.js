import express from 'express'
const router = express.Router()

import { getIdentifyingCode, getCurrentUser, getUserProfile, register, login, logout } from '../controller/auth.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { validateRegister, validateLogin } from '../middleware/validation.js'

// api/user

// 获取/更新用户信息 完全靠cookie中的token
router.get('/getCurrentUser', protectAuthRoute, asyncHandler(getCurrentUser))
// 注册
router.post('/register', validateRegister, asyncHandler(register))
// 登录
router.post('/login', validateLogin, asyncHandler(login))
// 登出
router.post('/logout', asyncHandler(logout))
// 获取登录验证码
router.get('/getIdentifyingCode', getIdentifyingCode)
// 进入profile页获取用户信息
router.get('/profile/:username', asyncHandler(getUserProfile))

export default router
