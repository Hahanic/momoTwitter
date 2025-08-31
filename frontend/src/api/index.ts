import axiosInstance from './axiosInstance'

import {
  type LoginPayload,
  type RegisterPayload,
  type CaptchaResponse,
  type CreatePostPayload,
  type Post,
  type PaginatedPostsResponse,
  type PostRepliesResponse,
  type UserProfile,
  type PostStats,
} from '@/types'

// 检查用户登录状态，靠自动发送的cookie
export const fetchCurrentUser = (): Promise<{ message: string; userProfile: UserProfile }> => {
  return axiosInstance.get('/auth/me')
}

// 用户更新信息
export const updateUserProfileAPI = (
  profileData: Partial<UserProfile>
): Promise<{ message: string; userProfile: UserProfile }> => {
  return axiosInstance.put('/auth/me', profileData)
}

// 用户注册
export const registerUser = (userRegisterData: RegisterPayload) => {
  return axiosInstance.post('/auth/register', userRegisterData)
}

// 用户登录
export const loginUser = (userLoginData: LoginPayload) => {
  return axiosInstance.post('/auth/login', userLoginData)
}

// 用户退出登录
export const logoutUser = () => {
  return axiosInstance.post('/auth/logout')
}

// 登录验证码
export const fetchCaptcha = (): Promise<CaptchaResponse> => {
  return axiosInstance.get('/auth/captcha')
}

// 获取用户信息
export const fetchUserByUsername = (
  username: string
): Promise<{ message: string; userProfile: UserProfile & { isFollowing?: boolean } }> => {
  return axiosInstance.get(`/users/${username}`)
}

// 用户发帖
export const createPost = (payload: CreatePostPayload): Promise<{ message: string; newPost: Post }> => {
  return axiosInstance.post('/posts', payload)
}

// 获取单条帖子
export const fetchPostById = (postId: string): Promise<Post> => {
  return axiosInstance.get(`/posts/${postId}`)
}

// 主页加载帖子
export const fetchPosts = (cursor: string | null = null, limit: number = 10): Promise<PaginatedPostsResponse> => {
  return axiosInstance.get('/posts', {
    params: {
      cursor,
      limit,
    },
  })
}

// 获取帖子回复
export const fetchPostReplies = (
  postId: string,
  cursor: string | null = null,
  limit: number = 10
): Promise<PostRepliesResponse> => {
  return axiosInstance.get(`/posts/${postId}/replies`, {
    params: {
      cursor,
      limit,
    },
  })
}

// 获取reply帖子的parentPost
export const fetchReplyParent = (replyId: string): Promise<{ message: string; resultParentPosts: Post[] }> => {
  return axiosInstance.get(`/posts/${replyId}/parent`)
}

// 获取某用户主页的帖子
export const fetchUserPostsByCategory = (
  category: string,
  username: string,
  cursor: string | null = null,
  limit: number = 10
): Promise<PaginatedPostsResponse> => {
  return axiosInstance.get(`/posts/${username}/category`, {
    params: {
      category,
      cursor,
      limit,
    },
  })
}

// 点赞帖子
export const likePost = (postId: string): Promise<{ message: string; isLiked: boolean; likesCount: number }> => {
  return axiosInstance.post(`/posts/${postId}/likes`)
}

// 收藏帖子
export const bookmarkPost = (
  postId: string
): Promise<{ message: string; isBookmarked: boolean; bookmarksCount: number }> => {
  return axiosInstance.post(`/posts/${postId}/bookmarks`)
}

// 浏览帖子
export const recordPostView = (
  postId: string
): Promise<{
  message: string
  stats: PostStats
}> => {
  return axiosInstance.post(`/posts/${postId}/views`)
}

// 上传单张图片
export const uploadImage = (
  formData: FormData
): Promise<{
  message: string
  filename: string
  originalname: string
  size: number
  url: string
  relativePath: string
  path: string
}> => {
  return axiosInstance.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
// 上传多张图片
export const uploadImages = (
  formData: FormData
): Promise<{
  message: string
  files: Array<{
    filename: string
    originalname: string
    size: number
    url: string
    relativePath: string
    path: string
  }>
  count: number
  totalSize: number
}> => {
  return axiosInstance.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
