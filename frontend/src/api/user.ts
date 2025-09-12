import axiosInstance from './axiosInstance'

import type { UserProfile } from '@/types'

// 用户更新信息
export const updateUserProfileAPI = (
  profileData: Partial<UserProfile>
): Promise<{ message: string; userProfile: UserProfile }> => {
  return axiosInstance.put('/auth/me', profileData)
}

// 获取用户信息
export const fetchUserByUsername = (
  username: string
): Promise<{ message: string; userProfile: UserProfile & { isFollowing?: boolean } }> => {
  return axiosInstance.get(`/users/${username}`)
}

// 关注/取消关注用户
export const followUserAPI = (username: string): Promise<{ message: string; isFollowing: boolean }> => {
  return axiosInstance.post(`/auth/${username}/follow`)
}
export const unfollowUserAPI = (username: string): Promise<{ message: string; isFollowing: boolean }> => {
  return axiosInstance.delete(`/auth/${username}/follow`)
}

// 获取某用户的关注/粉丝列表
export const fetchFollowing = async (username: string): Promise<{ message: string; following: UserProfile[] }> => {
  return axiosInstance.get(`/users/${username}/following`)
}
export const fetchFollowers = async (username: string): Promise<{ message: string; followers: UserProfile[] }> => {
  return axiosInstance.get(`/users/${username}/followers`)
}
