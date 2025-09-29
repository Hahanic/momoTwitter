import express from 'express'
const router = express.Router()

import { createConversation, getMessages, getMyConversations, markAsRead, sendMessage } from '../controller/chat.js'
import { protectAuthRoute } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// --- 会话管理 ---
// 获取当前用户的所有会话列表
router.get('/', protectAuthRoute, asyncHandler(getMyConversations))
// 创建新会话（私聊或群聊）
router.post('/', protectAuthRoute, asyncHandler(createConversation))

// --- 消息管理 ---
// 获取特定会话的消息（带分页）
router.get('/:conversationId/messages', protectAuthRoute, asyncHandler(getMessages))

// 在特定会话中发送新消息
router.post('/:conversationId/messages', protectAuthRoute, asyncHandler(sendMessage))

// --- 状态管理 ---
// 将特定会话标记为已读
router.post('/:conversationId/read', protectAuthRoute, asyncHandler(markAsRead))

export default router
