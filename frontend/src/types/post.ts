// 帖子
export interface Post {
  _id: string
  authorId: string
  content: string
  media: {
    type: 'image' | 'video' | 'gif'
    url: string
  }[]

  postType: 'standard' | 'reply' | 'quote' | 'retweet'
  visibility: 'public' | 'circle' | 'private'
  parentPostId?: string
  quotedPostId?: string
  mentions?: string[]
  hashtags?: string[]
  createdAt: string

  stats: PostStats

  authorInfo: {
    username: string
    displayName: string
    avatarUrl: string
    isVerified: boolean
  }

  currentUserInteraction?: {
    isLiked: boolean
    isBookmarked: boolean
    isRetweeted: boolean
  }
}

// 帖子统计信息
export interface PostStats {
  likesCount: number
  repliesCount: number
  bookmarksCount: number
  viewsCount: number
  retweetsCount: number
  quotesCount: number
}
// 时间线中的用户精简信息（转推者）
export interface MinimalUser {
  _id: string
  username: string
  displayName: string
  avatarUrl: string
  isVerified: boolean
}

// 时间线项：可能是普通帖子，也可能是转推事件
export interface TimelineItem {
  type: 'post' | 'retweet'
  timestamp: string
  data: Post
  // 当 type 为 'retweet' 时存在
  retweetedBy?: MinimalUser
}

// 主页加载帖子
export interface PaginatedPostsResponse {
  message: string
  posts: TimelineItem[]
  nextCursor: string | null
}

// 获取帖子回复
export interface PostRepliesResponse {
  replies: Post[]
  nextCursor: string | null
  parentPost: Post
}

// 前端发送帖子
export interface CreatePostPayload {
  content: string

  postType: 'standard' | 'reply' | 'quote' | 'retweet'

  media?: {
    type: 'image' | 'video' | 'gif'
    url: string
  }[]
  parentPostId?: string
  quotedPostId?: string
  visibility?: 'public' | 'circle' | 'private'
}
