import express from 'express'
const router = express.Router()

import { chatWithBot, getConversationHistory, getConversations } from '../controller/bot.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// 获取对话列表
router.get('/chat', protectAuthRoute, asyncHandler(getConversations))
// 创建新对话
router.post('/chat', protectAuthRoute, asyncHandler(chatWithBot))
// 继续对话
router.post('/chat/:id', protectAuthRoute, asyncHandler(chatWithBot))
// 获取单个对话历史
router.get('/chat/:id', protectAuthRoute, asyncHandler(getConversationHistory))
// 删除对话
// router.delete('/chat/:id', protectAuthRoute, asyncHandler(deleteConversation))

export default router
