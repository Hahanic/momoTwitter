import axiosInstance from './axiosInstance'

import {
  type CreatePostPayload,
  type Post,
  type PaginatedPostsResponse,
  type PostRepliesResponse,
  type PostStats,
} from '@/types'

// 用户发帖
export const createPost = (payload: CreatePostPayload): Promise<{ message: string; newPost: Post }> => {
  return axiosInstance.post('/posts', payload)
}

// 删除帖子/回复
export const deletePost = (postId: string): Promise<{ message: string; deletedCount: number }> => {
  return axiosInstance.delete(`/posts/${postId}`)
}

// 获取单条帖子
export const fetchPostById = (postId: string): Promise<Post> => {
  return axiosInstance.get(`/posts/${postId}`)
}

// 主页加载帖子
export const fetchPosts = (cursor: string | null = null, limit: number = 20): Promise<PaginatedPostsResponse> => {
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
  limit: number = 20
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
  limit: number = 20
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
