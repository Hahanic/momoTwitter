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
      trim: true,
      maxLength: 280, // 类似推特的字数限制
    },
    media: [
      {
        type: { type: String, enum: ['image', 'video', 'gif'], required: true },
        url: { type: String, required: true },
      },
    ],
    postType: {
      type: String,
      enum: ['standard', 'reply', 'quote'],
      default: 'standard',
    },
    parentPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    quotedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
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
    // 可见性
    visibility: {
      type: String,
      enum: ['public', 'circle'],
      default: 'public',
    },
    stats: {
      likesCount: { type: Number, default: 0 },
      repliesCount: { type: Number, default: 0 },
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
  },
  { timestamps: true }
)

const Post = mongoose.model('Post', postSchema)

export default Post
