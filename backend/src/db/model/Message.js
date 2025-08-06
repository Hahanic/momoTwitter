import mongoose from 'mongoose'

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
    // 消息中发送的媒体文件URL (图片、视频等)
    mediaUrl: {
      type: String,
    },
    // 记录已读此消息的用户ID列表，用于实现已读回执功能
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
) // 消息一般不更新，所以只需要 createdAt

const Message = mongoose.model('Message', messageSchema)

export default Message
