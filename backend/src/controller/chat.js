import mongoose from 'mongoose'

import Conversation from '../db/model/Conversation.js'
import Message from '../db/model/Message.js'
import User from '../db/model/User.js'
import { parseCursor, sendResponse } from '../utils/index.js'

/**
 * @desc    获取当前用户的所有会话列表
 * @route   GET /api/conversations
 * @access  Private
 */
export const getMyConversations = async (req, res) => {
  const userId = String(req.user.id)
  try {
    // 使用聚合管道一次性计算出未读数
    const conversations = await Conversation.aggregate([
      // 1. 找到当前用户参与的所有会话
      { $match: { 'participants.userId': new mongoose.Types.ObjectId(userId) } },

      // 2. 按最后消息时间倒序
      { $sort: { lastMessageAt: -1 } },

      // 3. 计算未读消息数
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'conversationId',
          as: 'messages',
        },
      },
      {
        $addFields: {
          currentUserParticipant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$participants',
                  as: 'p',
                  cond: { $eq: ['$$p.userId', new mongoose.Types.ObjectId(userId)] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          unreadCount: {
            $size: {
              // 如果未读消息不足100条，则返回实际数量。
              // 最后再计算这个截取后数组的大小。
              $slice: [
                {
                  $filter: {
                    input: '$messages',
                    as: 'msg',
                    cond: { $gt: ['$$msg.createdAt', '$currentUserParticipant.lastReadAt'] },
                  },
                },
                100, // 设置上限为 100
              ],
            },
          },
        },
      },
      // 4. 在私聊中，找出对方参与者的信息
      {
        $addFields: {
          peerParticipant: {
            $cond: {
              if: { $eq: ['$isGroup', false] },
              then: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$participants',
                      as: 'p',
                      cond: { $ne: ['$$p.userId', new mongoose.Types.ObjectId(userId)] },
                    },
                  },
                  0,
                ],
              },
              else: null,
            },
          },
        },
      },
      // 5. (新增) 关联 User 集合，获取私聊中对方用户的详细信息
      {
        $lookup: {
          from: 'users',
          localField: 'peerParticipant.userId',
          foreignField: '_id',
          as: 'peerUserDetails',
        },
      },
      {
        $addFields: {
          peerUser: { $arrayElemAt: ['$peerUserDetails', 0] },
        },
      },

      // 6. (重构) 使用 $project 最终塑造前端需要的数据结构
      {
        $project: {
          // --- 通用字段 ---
          _id: 1,
          isGroup: 1,
          lastMessageAt: 1,
          lastMessageSnippet: 1,
          unreadCount: 1,

          // --- 用户个人在此会话的设置 ---
          isSticky: '$currentUserParticipant.isSticky',
          isMuted: '$currentUserParticipant.isMuted',

          // --- 专为UI设计的显示字段 ---
          username: {
            $cond: {
              if: '$isGroup',
              then: null,
              else: '$peerUser.username',
            },
          },
          displayName: {
            $cond: {
              if: '$isGroup',
              then: '$displayName',
              // 私聊时，优先使用你给对方的备注，否则用对方的真实用户名
              else: { $ifNull: ['$currentUserParticipant.peerNickname', '$peerUser.displayName'] },
            },
          },
          displayAvatar: {
            $cond: {
              if: '$isGroup',
              then: '$displayAvatar',
              else: '$peerUser.avatarUrl',
            },
          },

          // (可选) 如果前端点击列表项需要对方ID，可以一并返回
          peerId: {
            $cond: { if: { $eq: ['$isGroup', false] }, then: '$peerUser._id', else: null },
          },
        },
      },
    ])

    // 对列表进行二次排序，把用户置顶（isSticky）的会话排在最前面
    conversations.sort((a, b) => {
      // 现在 a 和 b 对象上直接就有 isSticky 属性
      if (a.isSticky && !b.isSticky) return -1
      if (!a.isSticky && b.isSticky) return 1
      return 0 // 保持原有的 lastMessageAt 排序
    })

    sendResponse(res, 200, '成功', { conversations })
  } catch (error) {
    sendResponse(res, 500, '服务器错误', { error: error.message })
  }
}

/**
 * @desc    创建新会话（私聊或群聊）
 * @route   POST /api/conversations
 * @access  Private
 */
export const createConversation = async (req, res) => {
  const { isGroup, groupName, groupAvatar, participants, recipientId } = req.body
  const currentUserId = req.user.id
  const { io, userSockets } = req

  try {
    if (isGroup) {
      // 创建群聊
      if (!groupName) {
        return sendResponse(res, 400, '群组名称和至少 2 个参与者是必需的。')
      }

      // 将创建者也加入参与者列表
      const allParticipantIds = [...new Set([...participants.map((p) => p.userId), currentUserId])]

      const participantObjects = allParticipantIds.map((id) => ({
        userId: id,
        role: id.toString() === currentUserId.toString() ? 'owner' : 'member',
      }))

      const newGroup = await Conversation.create({
        isGroup: true,
        displayName: groupName,
        displayAvatar: groupAvatar,
        participants: participantObjects,
      })

      sendResponse(res, 201, '成功', { conversation: newGroup })
    } else {
      // 创建或获取私聊
      if (!recipientId) {
        return sendResponse(res, 400, 'Recipient ID is required for a private chat.')
      }

      const participantIds = [currentUserId, new mongoose.Types.ObjectId(recipientId)].sort()

      // 查找是否已存在该私聊
      const conv = await Conversation.findOne({
        isGroup: false,
        'participants.userId': { $all: participantIds },
        'participants.2': { $exists: false }, // 确保是两个人
      }).lean()

      const peerUser = await User.findById(recipientId).select('displayName username avatarUrl').lean()
      const senderUser = await User.findById(currentUserId).select('displayName username avatarUrl').lean()
      if (!peerUser) {
        return sendResponse(res, 404, '用户未找到。')
      }

      if (conv) {
        conv.username = peerUser.username || ''
        conv.displayName = peerUser.displayName || ''
        conv.displayAvatar = peerUser.avatarUrl || ''
        conv.peerId = peerUser._id
        return sendResponse(res, 200, '该对话已存在。', { conversation: conv })
      }

      // 创建新私聊
      const newPrivateChatDoc = await Conversation.create({
        isGroup: false,
        participants: participantIds.map((id) => ({ userId: id })),
      })
      // 构造给【接收者】的会话对象
      const conversationForRecipient = {
        _id: newPrivateChatDoc._id,
        isGroup: false,
        lastMessageAt: newPrivateChatDoc.createdAt,
        lastMessageSnippet: '你们现在可以开始聊天了',
        unreadCount: 1,
        isSticky: false,
        isMuted: false,
        username: senderUser.username,
        displayName: senderUser.displayName,
        displayAvatar: senderUser.avatarUrl,
        peerId: currentUserId,
      }

      // 构造给【发送者】的会话对象
      const conversationForSender = {
        ...conversationForRecipient,
        unreadCount: 0,
        username: peerUser.username,
        displayName: peerUser.displayName,
        displayAvatar: peerUser.avatarUrl,
        peerId: recipientId,
      }
      // --- 核心实时逻辑 ---
      // 1. 通知接收者客户端，有一个新会话来了
      const recipientSocketSet = userSockets.get(String(recipientId))
      if (recipientSocketSet && recipientSocketSet.size > 0) {
        recipientSocketSet.forEach((socketId) => {
          io.to(socketId).emit('newConversation', { conversation: conversationForRecipient })
        })

        // 2. 让接收者的 socket 悄悄加入这个新房间，以便能收到第一条消息
        const recipientSockets = await io.in(Array.from(recipientSocketSet)).fetchSockets()
        recipientSockets.forEach((socket) => {
          socket.join(String(newPrivateChatDoc._id))
          // 更新一下他本地的 convIds 缓存
          if (!socket.data.convIds.includes(newPrivateChatDoc._id)) {
            socket.data.convIds.push(newPrivateChatDoc._id)
          }
        })
      }

      // 3. 让创建者(发送者)的所有在线 socket 也加入新房间
      const senderSocketSet = userSockets.get(String(currentUserId))
      if (senderSocketSet && senderSocketSet.size > 0) {
        const senderSockets = await io.in(Array.from(senderSocketSet)).fetchSockets()
        senderSockets.forEach((socket) => {
          socket.join(String(newPrivateChatDoc._id))
          if (!socket.data.convIds.includes(newPrivateChatDoc._id)) {
            socket.data.convIds.push(newPrivateChatDoc._id)
          }
        })
      }

      sendResponse(res, 201, '成功', { conversation: conversationForSender })
    }
  } catch (error) {
    sendResponse(res, 500, '服务器错误', { error: error.message })
  }
}

/**
 * @desc    获取特定会话的消息（带分页）
 * @route   GET /api/conversations/:conversationId/messages
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const limit = parseInt(req.query.limit) || 30
    const cursor = parseCursor(req.query.cursor)

    // 安全检查：确保当前用户是该会话的成员
    const conv = await Conversation.findOne({ _id: conversationId, 'participants.userId': req.user.id })
    if (!conv) {
      return sendResponse(res, 403, '禁止访问：您不是此会话的成员。')
    }

    // 构建查询条件
    const query = { conversationId }
    if (cursor) {
      query.createdAt = { $lt: cursor }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'displayName username avatarUrl') // 填充发送者信息
      .lean()

    const nextCursor = messages.length < limit ? null : messages[messages.length - 1].createdAt.toISOString()

    sendResponse(res, 200, '成功', { messages: messages.reverse(), nextCursor })
  } catch (error) {
    sendResponse(res, 500, '服务器错误', { error: error.message })
  }
}
