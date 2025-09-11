import mongoose from 'mongoose'

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  deviceInfo: {
    browser: { type: String },
    os: { type: String },
    deviceType: { type: String, default: 'desktop' },
    deviceVendor: { type: String },
    deviceModel: { type: String },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // 设置一个 TTL 索引，让 MongoDB 自动删除30天前的会话记录
    // 这样 refreshToken 也就自然失效了
    expires: '30d',
  },
})

SessionSchema.index({ userId: 1 })

const Session = mongoose.model('Session', SessionSchema)

export default Session
