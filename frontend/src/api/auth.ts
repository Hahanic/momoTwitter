import axiosInstance from './axiosInstance'

import type { CaptchaResponse, AuthPayload, UserProfile } from '@/types'

// 登录验证码
export const fetchCaptcha = (): Promise<CaptchaResponse> => {
  return axiosInstance.get('/auth/captcha')
}

// 用户注册
export const registerUser = (
  userRegisterData: AuthPayload
): Promise<{ message: string; accessToken: string; user: UserProfile }> => {
  return axiosInstance.post('/auth/register', userRegisterData)
}

// 用户登录
export const loginUser = (
  userLoginData: AuthPayload
): Promise<{ message: string; accessToken: string; user: UserProfile }> => {
  return axiosInstance.post('/auth/login', userLoginData)
}

// 用户退出登录
export const logoutUser = () => {
  return axiosInstance.post('/auth/logout')
}

// 检查用户登录状态，靠自动发送的cookie
export const fetchCurrentUser = (): Promise<{ message: string; userProfile: UserProfile }> => {
  return axiosInstance.get('/auth/me')
}

// 刷新访问令牌
export const refreshAccessToken = async (): Promise<{ message: string; accessToken: string; user: UserProfile }> => {
  return await axiosInstance.post('/auth/refresh-token')
}
