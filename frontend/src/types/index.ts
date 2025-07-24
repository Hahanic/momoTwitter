// 用户登录
export interface userLoginData {
  email: string;
  password: string;
  userInputCode: string
}

// 用户登录时获取验证码
export interface recieveCode {
  status: string,
  code: string,
  message?: string
}

// 用户注册
export interface userRegisterData {
  email: string;
  password: string;
  emailCode: string
}

// 保存在本地的用户数据
export interface UserProfile  {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  stats: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
  };
  avatarUrl?: string;
  isVerified?: boolean;
  bio?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  pinnedPostId?: string;
}