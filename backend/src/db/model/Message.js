import mongoose from 'mongoose'

import Conversation from './Conversation.js'

const messageSchema = new mongoose.Schema(
  {
    // 该消息所属的对话ID
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true, // 必须索引，这是获取聊天记录的核心查询条件
    },
    // 消息发送者的用户ID
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 消息的文本内容
    content: {
      type: String,
      trim: true,
    },
    media: [
      {
        type: { type: String, enum: ['image', 'video', 'gif'], required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
)

/**
 * Mongoose 中间件 (Post-Save Hook)
 *
 * 每当一条新消息被成功保存后，这个钩子函数会自动触发，
 * 去更新对应 Conversation 的预览信息。
 */
messageSchema.post('save', async function (doc, next) {
  try {
    let snippet = ''

    // 根据你的 Message 模型，判断摘要内容
    if (doc.media && doc.media.length > 0) {
      const mediaType = doc.media[0].type
      if (mediaType === 'image') snippet = '[图片]'
      else if (mediaType === 'video') snippet = '[视频]'
      else if (mediaType === 'gif') snippet = '[GIF]'
      else snippet = '[媒体文件]'
    } else if (doc.content) {
      snippet = doc.content.length > 30 ? doc.content.substring(0, 30) + '...' : doc.content
    }

    await Conversation.findByIdAndUpdate(doc.conversationId, {
      lastMessageAt: doc.createdAt,
      lastMessageSnippet: snippet,
    })
  } catch (error) {
    console.error('自动更新失败:', error)
  }
  next()
})

messageSchema.index({ conversationId: 1, createdAt: -1 }) // 复合索引，优化按会话获取消息的查询

const Message = mongoose.model('Message', messageSchema)

export default Message
