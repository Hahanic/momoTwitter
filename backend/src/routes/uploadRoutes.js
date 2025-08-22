import express from 'express'
const router = express.Router()

import { uploadPostImage, uploadPostImages } from '../controller/upload.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import upload from '../middleware/upload.js'

// api/upload

// 上传单张图片
router.post('/image', protectAuthRoute, upload.single('image'), asyncHandler(uploadPostImage))
router.post('/images', protectAuthRoute, upload.array('images', 4), asyncHandler(uploadPostImages))

export default router
