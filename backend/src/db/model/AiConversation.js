import mongoose from 'mongoose'

// 单条消息结构
const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false, timestamps: true }
)

// 整个对话结构
const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: [aiMessageSchema],
    title: {
      type: String,
      default: '新的对话',
    },
  },
  { timestamps: true }
)

const AiConversation = mongoose.model('AiConversation', aiConversationSchema)

export default AiConversation
