import { verifyUserToken } from '../utils/index.js'

export const protectAuthRoute = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: 'authMiddleware: token缺失' })
  }

  try {
    const userId = verifyUserToken(token)
    if (!userId) {
      return res.status(401).json({ message: 'authMiddleware: token无效或已过期' })
    }
    req.user = { id: userId }
    next()
  } catch (error) {
    return res.status(401).json({ message: 'authMiddleware: 用户未认证请重新登录' })
  }
}
