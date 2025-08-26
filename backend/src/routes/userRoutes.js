import express from 'express'
const router = express.Router()

import { getUserProfile } from '../controller/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// 获取用户主页信息
router.get('/:username', asyncHandler(getUserProfile))

export default router
