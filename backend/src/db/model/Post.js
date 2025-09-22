import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: false,
      maxLength: 301,
    },
    postType: {
      type: String,
      enum: ['standard', 'reply', 'quote'],
      default: 'standard',
    },
    // 可见性
    visibility: {
      type: String,
      enum: ['public', 'circle', 'private'],
      default: 'public',
    },
    stats: {
      likesCount: { type: Number, default: 0 },
      repliesCount: { type: Number, default: 0 },
      retweetsCount: { type: Number, default: 0 },
      quotesCount: { type: Number, default: 0 },
      bookmarksCount: { type: Number, default: 0 },
      viewsCount: { type: Number, default: 0 },
    },
    // 反范式化，提高读取性能
    authorInfo: {
      username: String,
      displayName: String,
      avatarUrl: String,
      isVerified: Boolean,
    },
    // 回复
    parentPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    // 引用
    quotedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    media: [
      {
        type: { type: String, enum: ['image', 'video', 'gif'], required: true },
        url: { type: String, required: true },
      },
    ],
    // @的用户 ID列表
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // #话题 标签列表
    hashtags: [
      {
        type: String,
        index: true,
      },
    ],
  },
  { timestamps: true }
)

postSchema.index({ content: 'text' })

const Post = mongoose.model('Post', postSchema)

export default Post
