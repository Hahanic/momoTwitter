import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// 复合唯一索引，防止用户重复点赞同一个帖子
likeSchema.index({ userId: 1, postId: 1 }, { unique: true })

const Like = mongoose.model('Like', likeSchema)

export default Like
