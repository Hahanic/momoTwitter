// 用户登录
export interface AuthPayload {
  email: string
  password: string
  code: string
}

// 用户登录时获取验证码
export interface CaptchaResponse {
  code: string
  message: string
}
