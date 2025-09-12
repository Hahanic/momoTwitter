// 用户登录
export interface LoginPayload {
  email: string
  password: string
  recieveCode: string
}

// 用户登录时获取验证码
export interface CaptchaResponse {
  code: string
  message: string
}

// 用户注册
export interface RegisterPayload {
  email: string
  password: string
  emailCode: string
}
