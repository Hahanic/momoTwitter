import axiosInstance from './axiosInstance';

import { type userLoginData, type userRegisterData, type recieveCode, type CreatePostPayload, type RecievePostPayload } from '@/types';

// 用户登录
export const userLogin = (userLoginData: userLoginData) => {
  return axiosInstance.post('/login', userLoginData)
}

// 用户退出登录
export const userLogout = () => {
  return axiosInstance.post('/logout')
}

export const getIdentifyingCode = (): Promise<recieveCode> => {
  return axiosInstance.get('/getIdentifyingCode')
}

// 用户注册
export const userRegister = (userRegisterData: userRegisterData) => {
  return axiosInstance.post('/register', userRegisterData)
}

// 用户发帖
export const createPost = (payload: CreatePostPayload): Promise<RecievePostPayload> => {
  return axiosInstance.post('/post/create', payload)
}

// 主页加载帖子
export const getPosts = (page: number) => {
  return axiosInstance.get('/post/getPosts')
}