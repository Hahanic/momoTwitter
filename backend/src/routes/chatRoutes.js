import express from 'express'
const router = express.Router()

import { createConversation, getMessages, getMyConversations } from '../controller/chat.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// 获取当前用户的所有会话列表
router.get('/', protectAuthRoute, asyncHandler(getMyConversations))
// 创建新会话（私聊或群聊）
router.post('/', protectAuthRoute, asyncHandler(createConversation))
// 获取特定会话的消息（带分页）
router.get('/:conversationId/messages', protectAuthRoute, asyncHandler(getMessages))

export default router
