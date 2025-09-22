import mongoose from 'mongoose'

const retweetSchema = new mongoose.Schema(
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

retweetSchema.index({ userId: 1, postId: 1 }, { unique: true })

const Retweet = mongoose.model('Retweet', retweetSchema)

export default Retweet
