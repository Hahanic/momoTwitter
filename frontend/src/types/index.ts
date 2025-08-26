// 用户登录
export interface LoginPayload {
  email: string
  password: string
  recieveCode: string
}

// 用户登录时获取验证码
export interface CaptchaResponse {
  code: string
  message: string
}

// 用户注册
export interface RegisterPayload {
  email: string
  password: string
  emailCode: string
}

// 用户数据
export interface UserProfile {
  _id: string
  username: string
  displayName: string
  email: string
  stats: {
    followersCount: number
    followingCount: number
    postsCount: number
  }
  avatarUrl: string
  isVerified: boolean
  bio?: string
  bannerUrl?: string
  location?: string
  website?: string
  pinnedPostId?: string
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

// 主页加载帖子
export interface PaginatedPostsResponse {
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
