import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema(
  {
    // 参与者的用户ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // 角色：仅在群聊中有效
    role: {
      type: String,
      enum: ['member', 'admin', 'owner'],
      default: 'member',
    },

    // 加入时间
    joinAt: {
      type: Date,
      default: Date.now,
    },

    // ---- 以下是每个用户对此会话的个性化设置 ----

    // 在1v1私聊中，当前用户给对方设置的备注昵称
    peerNickname: {
      type: String,
      trim: true,
    },

    // 是否将此会话消息设置为免打扰
    isMuted: {
      type: Boolean,
      default: false,
    },

    // 是否置顶此会话
    isSticky: {
      type: Boolean,
      default: false,
    },

    // 用户最后一次“看到”这个会话的时间，用于计算未读数
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const conversationSchema = new mongoose.Schema(
  {
    // 是否是群聊
    isGroup: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },

    // 会话的所有参与者
    participants: [participantSchema],

    /* --------- 群聊信息 (isGroup: true 时有效) --------- */
    displayName: {
      type: String,
      trim: true,
    },
    displayAvatar: {
      type: String,
    },
    groupAnnouncement: {
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

// 1. 核心查询索引：高效查找某个用户的所有会话，并能直接利用此索引按最新消息排序。
conversationSchema.index({ 'participants.userId': 1, lastMessageAt: -1 })
// 2. 私聊防重复索引：
conversationSchema.index(
  { 'participants.userId': 1 },
  {
    unique: true,
    partialFilterExpression: {
      isGroup: false,
      'participants.1': { $exists: true },
      'participants.2': { $exists: false },
    },
  }
)

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation
