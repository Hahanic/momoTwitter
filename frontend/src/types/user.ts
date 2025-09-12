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
