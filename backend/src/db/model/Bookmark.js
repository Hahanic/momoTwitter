import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
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
}, { timestamps: { createdAt: true, updatedAt: false } });

// 复合唯一索引，防止用户重复收藏同一个帖子
bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;