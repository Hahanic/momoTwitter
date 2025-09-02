import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    // 参与对话的所有用户ID
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // 是否是群聊
    isGroup: {
      type: Boolean,
      default: false,
    },
    // 群聊名称
    groupName: {
      type: String,
      trim: true,
    },
    // 群聊头像
    groupAvatar: {
      type: String,
    },

    // 最后一条消息的发送时间，用于对话列表排序
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // 最后一条消息的摘要，用于在列表页预览
    lastMessageSnippet: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
)

// 为 participants 字段创建索引，以便快速查找用户参与的所有对话
conversationSchema.index({ participants: 1 })
// 为 lastMessageAt 字段创建索引，以便快速排序对话列表
conversationSchema.index({ lastMessageAt: -1 })

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation
