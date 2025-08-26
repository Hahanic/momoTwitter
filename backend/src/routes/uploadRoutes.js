import express from 'express'
const router = express.Router()

import { uploadPostImage, uploadPostImages } from '../controller/upload.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// api/upload

// 上传单张图片
router.post(
  '/image',
  protectAuthRoute, // 认证
  asyncHandler(uploadPostImage)
)

// 上传多张图片
router.post('/images', protectAuthRoute, asyncHandler(uploadPostImages))

export default router
