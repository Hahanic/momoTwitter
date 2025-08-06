import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    displayName: {
      type: String,
    },
    // 个人简介
    bio: {
      type: String,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    bannerUrl: {
      type: String,
    },
    location: {
      type: String,
    },
    website: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // 反范式
    stats: {
      postsCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
    },
    // 顶置推文
    pinnedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

export default User
