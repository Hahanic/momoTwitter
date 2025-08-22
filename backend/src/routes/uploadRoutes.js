import express from 'express'
const router = express.Router()

import { uploadPostImage, uploadPostImages } from '../controller/upload.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import upload, { connectionGuard, disableCleanupOnSuccess } from '../middleware/upload.js'

// api/upload

// 上传单张图片
router.post(
  '/image',
  protectAuthRoute, // 认证
  connectionGuard, // 连接监控
  disableCleanupOnSuccess, // 成功后关闭清理监控
  upload.single('image'),
  asyncHandler(uploadPostImage)
)

// 上传多张图片
router.post(
  '/images',
  protectAuthRoute,
  connectionGuard, // 连接监控
  disableCleanupOnSuccess, // 成功后关闭清理监控
  upload.array('images', 4),
  asyncHandler(uploadPostImages)
)

export default router
