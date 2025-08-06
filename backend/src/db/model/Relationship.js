import mongoose from 'mongoose'

const relationshipSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// 创建复合唯一索引，防止重复关注
relationshipSchema.index({ followerId: 1, followingId: 1 }, { unique: true })

const Relationship = mongoose.model('Relationship', relationshipSchema)

export default Relationship
