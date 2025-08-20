import axiosInstance from './axiosInstance'

import {
  type userLoginData,
  type userRegisterData,
  type recieveCode,
  type CreatePostPayload,
  type RecievePostPayload,
  type getPost,
  type getPostReply,
  type UserProfile,
  type PostStats,
} from '@/types'

// 检查用户登录状态，靠自动发送的cookie
export const getCurrentUser = (): Promise<{ message: string; userProfile: UserProfile }> => {
  return axiosInstance.get('/user/getCurrentUser')
}

// 用户登录
export const userLogin = (userLoginData: userLoginData) => {
  return axiosInstance.post('/user/login', userLoginData)
}

// 用户退出登录
export const userLogout = () => {
  return axiosInstance.post('/user/logout')
}

// 登录验证码
export const getIdentifyingCode = (): Promise<recieveCode> => {
  return axiosInstance.get('/user/getIdentifyingCode')
}

// 用户注册
export const userRegister = (userRegisterData: userRegisterData) => {
  return axiosInstance.post('/user/register', userRegisterData)
}

// 获取用户信息
export const getUserProfile = (
  username: string
): Promise<{ message: string; userProfile: UserProfile & { isFollowing?: boolean } }> => {
  return axiosInstance.get(`/user/profile/${username}`)
}

// 用户发帖
export const apiCreatePost = (
  payload: CreatePostPayload
): Promise<{ message: string; newPost: RecievePostPayload }> => {
  return axiosInstance.post('/post/create', payload)
}

// 获取单条帖子
export const apiGetOnePost = (postId: string): Promise<RecievePostPayload> => {
  return axiosInstance.get(`/post/${postId}/get`)
}

// 主页加载帖子
export const getPosts = (cursor: string | null = null, limit: number = 10): Promise<getPost> => {
  return axiosInstance.get('/post/getPost', {
    params: {
      cursor,
      limit,
    },
  })
}

// 获取帖子回复
export const getPostReplies = (
  postId: string,
  cursor: string | null = null,
  limit: number = 10
): Promise<getPostReply> => {
  return axiosInstance.get(`/post/${postId}/replies`, {
    params: {
      cursor,
      limit,
    },
  })
}

// 获取reply帖子的parentPost
export const getReplyParentPost = (
  replyId: string
): Promise<{ message: string; resultParentPosts: RecievePostPayload[] }> => {
  return axiosInstance.get(`/post/${replyId}/parent`)
}

// 获取某用户主页的帖子
export const getUserCategoryPosts = (
  category: string,
  username: string,
  cursor: string | null = null,
  limit: number = 10
): Promise<getPost> => {
  return axiosInstance.get(`/post/${username}/category`, {
    params: {
      category,
      cursor,
      limit,
    },
  })
}

// 点赞帖子
export const apiLikePost = (postId: string): Promise<{ message: string; isLiked: boolean; likesCount: number }> => {
  return axiosInstance.post(`/post/${postId}/like`)
}

// 收藏帖子
export const apiBookmarkPost = (
  postId: string
): Promise<{ message: string; isBookmarked: boolean; bookmarksCount: number }> => {
  return axiosInstance.post(`/post/${postId}/bookmark`)
}

// 浏览帖子
export const apiViewPost = (
  postId: string
): Promise<{
  message: string
  stats: PostStats
}> => {
  return axiosInstance.post(`/post/${postId}/view`)
}
