// 用户登录
export interface userLoginData {
  email: string
  password: string
  userInputCode: string
}

// 用户登录时获取验证码
export interface recieveCode {
  status: string
  code: string
  message?: string
}

// 用户注册
export interface userRegisterData {
  email: string
  password: string
  emailCode: string
}

// 保存在本地的用户数据
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
  avatarUrl?: string
  isVerified?: boolean
  bio?: string
  bannerUrl?: string
  location?: string
  website?: string
  pinnedPostId?: string
}

// 帖子状态
export interface PostStats {
  likesCount: number
  repliesCount: number
  bookmarksCount: number
  viewsCount: number
  retweetsCount: number
  quotesCount: number
}

// 前端接收帖子
export interface RecievePostPayload {
  _id: string
  authorId: string
  content: string
  media: {
    type: 'image' | 'video' | 'gif'
    url: string
  }[]

  postType: 'standard' | 'reply' | 'quote' | 'retweet'
  parentPostId?: string
  quotedPostId?: string
  retweetedPostId?: string
  mentions?: string[]
  hashtags?: string[]
  visibility?: string
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

  postType: 'standard' | 'reply' | 'quote'

  media?: {
    type: 'image' | 'video' | 'gif'
    url: string
  }[]

  // 条件必需：当 postType 为 'reply' 时，必须提供父帖子的 ID
  parentPostId?: string
  // 条件必需：当 postType 为 'quote' 时，必须提供被引用帖子的 ID
  quotedPostId?: string
  // 可选字段：投票信息
  poll?: {
    question: string
    // 前端只需要传递选项的文本即可
    options: string[]
    // 投票持续时间，比如 '1d', '3h', '30m'
    duration: string
  }
  // 可选字段：可见性设置
  visibility?: 'public' | 'circle'
}
