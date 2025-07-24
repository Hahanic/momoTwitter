import axiosInstance from './axiosInstance';

import { type userLoginData, type userRegisterData, type recieveCode } from '@/types';

// 用户登录
export const userLogin = (userLoginData: userLoginData) => {
  return axiosInstance.post('/login', userLoginData)
}

export const getIdentifyingCode = (): Promise<recieveCode> => {
  return axiosInstance.get('/getIdentifyingCode')
}

// 用户注册
export const userRegister = (userRegisterData: userRegisterData) => {
  return axiosInstance.post('/register', userRegisterData)
}