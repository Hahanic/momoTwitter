// 用户登录
export interface userLoginData {
  email: string
  password: string
  userInputCode: string
}

// 用户登录时获取验证码
export interface recieveCode {
  code: string
  message: string
}

// 用户注册
export interface userRegisterData {
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
export interface RecievePostPayload {
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
export interface getPost {
  posts: RecievePostPayload[]
  nextCursor: string | null
}

// 获取帖子回复
export interface getPostReply {
  replies: RecievePostPayload[]
  nextCursor: string | null
  parentPost: RecievePostPayload
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
