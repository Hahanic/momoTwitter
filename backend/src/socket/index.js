import Conversation from '../db/model/Conversation.js'
import Message from '../db/model/Message.js'
import { verifyAccessToken } from '../utils/index.js'

// 全局在线用户 socket 集合: userId -> Set<socketId>
const userSockets = new Map()

export function initSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token
      if (!token) return next(new Error('NO_TOKEN'))
      const userId = verifyAccessToken(token)
      if (!userId) return next(new Error('AUTH_FAIL'))
      socket.data.userId = userId
      next()
    } catch {
      next(new Error('AUTH_FAIL'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.data.userId

    // 记录 socket
    if (!userSockets.has(userId)) userSockets.set(userId, new Set())
    userSockets.get(userId).add(socket.id)

    // 用户连接时，加入所有会话房间
    async function joinAll() {
      try {
        const convIds = await Conversation.find({ 'participants.userId': userId }).distinct('_id')
        socket.data.convIds = convIds
        const roomIds = convIds.map((id) => String(id))
        if (roomIds.length > 0) socket.join(roomIds)
        return convIds
      } catch (error) {
        console.error('Error joining all conversations:', error)
      }
    }

    await joinAll()

    // 如果是该用户第一个 socket，才认为真正上线（避免多标签页重复广播） 适配多设备登录
    const isFirstConnection = userSockets.get(userId)?.size === 1

    // 返回此用户相关的在线成员 userId 去重后的数组 在线用户列表
    let initialOnlineUserIds = []
    try {
      const convIds = socket.data.convIds || []
      if (convIds.length) {
        // 仅筛选私聊会话 (isGroup: false)；群聊成员不在此初始列表中返回
        const convs = await Conversation.find({ _id: { $in: convIds }, isGroup: false }, 'participants.userId').lean()
        const peerSet = new Set()
        for (const conv of convs) {
          for (const p of conv.participants) {
            const uid = String(p.userId)
            if (uid === String(userId)) continue
            if (userSockets.has(uid)) peerSet.add(uid)
          }
        }
        initialOnlineUserIds = Array.from(peerSet)
      }
    } catch (e) {
      console.error('presence init error', e)
    }

    // 给当前客户端发送其需要渲染的已在线用户集合
    socket.emit('presence:init', { onlineUserIds: initialOnlineUserIds })

    // 广播该用户上线给所有共同会话内其它在线成员
    if (isFirstConnection) {
      // 遍历该用户加入的会话，向房间除自己外广播
      const convIds = socket.data.convIds || []
      convIds.forEach((cid) => {
        socket.to(String(cid)).emit('presence', { userId, status: 'online' })
      })
    }

    socket.emit('connected', { userId })

    socket.on('leaveConversation', (conversationId) => {
      console.log(`User ${userId} leaving conversation ${conversationId}`)
      socket.leave(conversationId)
    })

    socket.on('sendMessage', async ({ conversationId, content, media }) => {
      if (!content && (!media || media.length === 0)) return
      // 校验成员
      const conv = await Conversation.findOne({
        _id: conversationId,
        'participants.userId': userId,
      })
      if (!conv) return

      const msg = await Message.create({
        conversationId,
        senderId: userId,
        content,
        media,
      })

      // 更新会话摘要
      conv.lastMessageAt = msg.createdAt
      conv.lastMessageSnippet = content?.slice(0, 200) || (media?.length ? '[媒体]' : '')
      // 更新 lastReadAt
      const me = (conv.participants || []).find((p) => String(p.userId) === String(userId))
      if (me) {
        me.lastReadAt = msg.createdAt
      }
      await conv.save()

      const populatedMessage = await Message.findById(msg._id)
        .populate('senderId', 'username avatarUrl displayName')
        .lean()

      // 发给本会话所有用户
      io.to(String(conversationId)).emit('newMessage', {
        conversationId,
        message: populatedMessage,
      })

      // 更新会话列表的显示信息
      io.to(String(conversationId)).emit('conversationUpdated', {
        conversationId,
        lastMessageAt: conv.lastMessageAt,
        lastMessageSnippet: conv.lastMessageSnippet,
      })
    })

    // 消息已读
    socket.on('markRead', async ({ conversationId }) => {
      const now = new Date()
      await Conversation.updateOne(
        { _id: conversationId, 'participants.userId': userId },
        { $set: { 'participants.$.lastReadAt': now } }
      )
    })

    // 在线状态
    socket.on('disconnect', () => {
      const userSocketSet = userSockets.get(userId)
      if (userSocketSet) {
        userSocketSet.delete(socket.id)
        const isOffline = userSocketSet.size === 0
        if (isOffline) {
          userSockets.delete(userId)
          // 向所有相关会话广播离线
          const convIds = socket.data.convIds || []
          ;(convIds || []).forEach((cid) => {
            socket.to(String(cid)).emit('presence', { userId, status: 'offline' })
          })
        }
      }
    })
  })
}

export { userSockets }
