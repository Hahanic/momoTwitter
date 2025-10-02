import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'reply', 'mention', 'follow', 'quote', 'retweet'],
      required: true,
    },
    targetPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
