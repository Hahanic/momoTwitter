import mongoose from 'mongoose'

import Conversation from '../db/model/Conversation.js'
import Message from '../db/model/Message.js'
import { parseCursor, sendResponse } from '../utils/index.js'

/**
 * @desc    获取当前用户的所有会话列表
 * @route   GET /api/conversations
 * @access  Private
 */
export const getMyConversations = async (req, res) => {
  const userId = String(req.user.id)
  try {
    // 使用聚合管道一次性计算出未读数，性能极高
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
          displayName: {
            $cond: {
              if: '$isGroup',
              then: '$groupName',
              // 私聊时，优先使用你给对方的备注，否则用对方的真实用户名
              else: { $ifNull: ['$currentUserParticipant.peerNickname', '$peerUser.displayName'] },
            },
          },
          displayAvatar: {
            $cond: {
              if: '$isGroup',
              then: '$groupAvatar',
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

// 获取对话列表
// {
//   "message": "成功",
//   "conversations": [
//     {
//       "_id": "68d9e997623eb6628de89383",
//       "isGroup": true,
//       "lastMessageSnippet": "333333333333：",
//       "lastMessageAt": "2025-09-29T02:45:35.586Z",
//       "unreadCount": 3,
//       "isSticky": false,
//       "isMuted": false,
//       "displayName": "LimbusCompany",
//       "displayAvatar": "/Avatar",
//       "peerId": null
//     },
//     {
//       "_id": "68d967cf6c849aa0704c668b",
//       "isGroup": false,
//       "lastMessageSnippet": "晚上好",
//       "lastMessageAt": "2025-09-28T17:06:34.918Z",
//       "unreadCount": 3,
//       "isSticky": false,
//       "isMuted": false,
//       "displayName": "JASttenet",
//       "displayAvatar": "h89.jpg",
//       "peerId": "68a82cabbb483c9c253242d8"
//     }
//   ]
// }

/**
 * @desc    创建新会话（私聊或群聊）
 * @route   POST /api/conversations
 * @access  Private
 */
export const createConversation = async (req, res) => {
  const { isGroup, groupName, groupAvatar, participants, recipientId } = req.body
  const currentUserId = req.user.id

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
        groupName,
        groupAvatar,
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
      let conv = await Conversation.findOne({
        isGroup: false,
        'participants.userId': { $all: participantIds },
        'participants.2': { $exists: false }, // 确保是两个人
      }).lean()

      if (conv) {
        return sendResponse(res, 200, '该对话已存在。', { conversation: conv })
        // {
        //   "message": "该对话已存在。",
        //   "conversation": {
        //     "_id": "68d967cf6c849aa0704c668b",
        //     "isGroup": false,
        //     "participants": [
        //       {
        //         "userId": "68a82cabbb483c9c253242d8",
        //         "role": "member",
        //         "isMuted": false,
        //         "isSticky": true,
        //         "joinAt": "2025-09-28T16:52:31.247Z",
        //         "lastReadAt": "2025-09-28T16:52:31.247Z"
        //       },
        //       {
        //         "userId": "68b5aa61eec0de072188822d",
        //         "role": "member",
        //         "isMuted": false,
        //         "isSticky": false,
        //         "joinAt": "2025-09-28T16:52:31.247Z",
        //         "lastReadAt": "2025-09-28T16:52:31.247Z"
        //       }
        //     ],
        //     "lastMessageSnippet": "晚上好",
        //     "lastMessageAt": "2025-09-28T17:06:34.918Z",
        //     "createdAt": "2025-09-28T16:52:31.251Z",
        //     "updatedAt": "2025-09-28T17:06:34.922Z",
        //     "__v": 0
        //   }
        // }
      }

      // 创建新私聊
      const newPrivateChat = await Conversation.create({
        isGroup: false,
        participants: participantIds.map((id) => ({ userId: id })),
      })
      sendResponse(res, 201, '成功', { conversation: newPrivateChat })
      // {
      //   "message": "成功",
      //   "conversation": {
      //     "isGroup": false,
      //     "participants": [
      //       {
      //         "userId": "68ad5bec5048fd0c69a358b4",
      //         "role": "member",
      //         "isMuted": false,
      //         "isSticky": false,
      //         "joinAt": "2025-09-29T02:52:34.820Z",
      //         "lastReadAt": "2025-09-29T02:52:34.820Z"
      //       },
      //       {
      //         "userId": "68b5aa61eec0de072188822d",
      //         "role": "member",
      //         "isMuted": false,
      //         "isSticky": false,
      //         "joinAt": "2025-09-29T02:52:34.820Z",
      //         "lastReadAt": "2025-09-29T02:52:34.820Z"
      //       }
      //     ],
      //     "lastMessageSnippet": "",
      //     "_id": "68d9f4726db3a6bf5be98d5e",
      //     "lastMessageAt": "2025-09-29T02:52:34.820Z",
      //     "createdAt": "2025-09-29T02:52:34.823Z",
      //     "updatedAt": "2025-09-29T02:52:34.823Z",
      //     "__v": 0
      //   }
      // }
    }
  } catch (error) {
    sendResponse(res, 500, '服务器错误', { error: error.message })
  }
}

// 创建群聊
// {
//   "message": "成功",
//   "conversation": {
//     "isGroup": true,
//     "participants": [
//       {
//         "userId": "68a82cabbb483c9c253242d8",
//         "role": "member",
//         "isMuted": false,
//         "isSticky": false,
//         "joinAt": "2025-09-29T02:50:21.710Z",
//         "lastReadAt": "2025-09-29T02:50:21.710Z"
//       },
//       {
//         "userId": "68b5aa61eec0de072188822d",
//         "role": "owner",
//         "isMuted": false,
//         "isSticky": false,
//         "joinAt": "2025-09-29T02:50:21.710Z",
//         "lastReadAt": "2025-09-29T02:50:21.710Z"
//       }
//     ],
//     "groupName": "LimbusCompany",
//     "groupAvatar": "/Avatar",
//     "lastMessageSnippet": "",
//     "_id": "68d9f3ed788fe052ed6f4423",
//     "lastMessageAt": "2025-09-29T02:50:21.711Z",
//     "createdAt": "2025-09-29T02:50:21.714Z",
//     "updatedAt": "2025-09-29T02:50:21.714Z",
//     "__v": 0
//   }
// }

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
      .select('-readBy')
      .lean()

    const nextCursor = messages.length < limit ? null : messages[messages.length - 1].createdAt.toISOString()

    sendResponse(res, 200, '成功', { messages: messages.reverse(), nextCursor }) // 通常前端需要从旧到新显示
  } catch (error) {
    sendResponse(res, 500, '服务器错误', { error: error.message })
  }
}

// 获取
// {
//   "message": "成功",
//   "messages": [
//     {
//       "_id": "68d9f20fb22a61da9b4239e6",
//       "conversationId": "68d9e997623eb6628de89383",
//       "senderId": {
//         "_id": "68b5aa61eec0de072188822d",
//         "username": "1",
//         "avatarUrl": "ht8.jpg"
//       },
//       "content": "111111111111111111111111111111：",
//       "media": [],
//       "createdAt": "2025-09-29T02:42:23.058Z",
//       "updatedAt": "2025-09-29T02:42:23.058Z",
//       "__v": 0
//     },
//     {
//       "_id": "68d9f26265db77c6772d7c4a",
//       "conversationId": "68d9e997623eb6628de89383",
//       "senderId": {
//         "_id": "68b5aa61eec0de072188822d",
//         "username": "1",
//         "avatarUrl": "https://pub-c11d6d29dc6849578fa22b903960e39f.r2.dev/1757344157106_64ac6242841f6b48.jpg"
//       },
//       "content": "222222222222222222222222：",
//       "media": [],
//       "createdAt": "2025-09-29T02:43:46.123Z",
//       "updatedAt": "2025-09-29T02:43:46.123Z",
//       "__v": 0
//     }
//   ],
//   "nextCursor": null
// }

// 发送
// {
//   "message": "成功",
//   "_id": "68d9f2cf45838ab3e437c630",
//   "conversationId": "68d9e997623eb6628de89383",
//   "senderId": {
//     "_id": "68b5aa61eec0de072188822d",
//     "username": "1",
//     "avatarUrl": "https://pub-c11d6d29dc6849578fa22b903960e39f.r2.dev/1757344157106_64ac6242841f6b48.jpg"
//   },
//   "content": "333333333333：",
//   "media": [],
//   "createdAt": "2025-09-29T02:45:35.586Z",
//   "updatedAt": "2025-09-29T02:45:35.586Z",
//   "__v": 0
// }

/**
 * @desc    在特定会话中发送新消息
 * @route   POST /api/conversations/:conversationId/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { content, media } = req.body
    const senderId = req.user.id

    if (!content && (!media || media.length === 0)) {
      return sendResponse(res, 400, '消息内容或媒体不能为空。')
    }

    // 安全检查
    const conv = await Conversation.findOne({ _id: conversationId, 'participants.userId': senderId })
    if (!conv) {
      return sendResponse(res, 403, '禁止访问：您不是此会话的成员。')
    }

    const newMessage = new Message({
      conversationId,
      senderId,
      content,
      media,
    })

    await newMessage.save()

    // 填充发送者信息后返回
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'username avatarUrl')
      .select('-readBy')
      .lean()
    // {
    //   "message": "成功",
    //   "_id": "68d9f7df8ad46820a9a5d372",
    //   "conversationId": "68d9f7bb8ad46820a9a5d36f",
    //   "senderId": {
    //     "_id": "68b5aa61eec0de072188822d",
    //     "username": "1",
    //     "avatarUrl": "https://pub-c11d6d29dc6849578fa22b903960e39f.r2.dev/1757344157106_64ac6242841f6b48.jpg"
    //   },
    //   "content": "1111111111：",
    //   "media": [],
    //   "createdAt": "2025-09-29T03:07:11.634Z",
    //   "updatedAt": "2025-09-29T03:07:11.634Z",
    //   "__v": 0
    // }

    // !!! 重要: 在这里通过 WebSocket/Socket.IO 将 populatedMessage 推送给会话中的其他在线成员
    // io.to(conversationId).emit('newMessage', populatedMessage);

    sendResponse(res, 201, '成功', populatedMessage)
  } catch (error) {
    sendResponse(res, 500, '服务器错误', { error: error.message })
  }
}

/**
 * @desc    将特定会话标记为已读
 * @route   POST /api/conversations/:conversationId/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user.id

    await Conversation.updateOne(
      { _id: conversationId, 'participants.userId': userId },
      { $set: { 'participants.$.lastReadAt': new Date() } }
    )

    sendResponse(res, 200, '会话已标记为已读。')
  } catch (error) {
    sendResponse(res, 500, '服务器错误', { error: error.message })
  }
}
