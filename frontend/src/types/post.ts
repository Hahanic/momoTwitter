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
  retweetedPostId?: string
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

// 主页加载帖子
export interface PaginatedPostsResponse {
  message: string
  posts: Post[]
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
