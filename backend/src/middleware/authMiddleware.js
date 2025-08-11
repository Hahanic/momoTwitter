import { verifyUserToken } from '../utils/index.js'

export const protectAuthRoute = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: '用户未认证请重新登录' })
  }

  try {
    const userId = verifyUserToken(token)
    if (!userId) {
      return res.status(401).json({ message: '用户未认证请重新登录' })
    }
    req.user = { id: userId }
    next()
  } catch (error) {
    return res.status(401).json({ message: '用户未认证请重新登录' })
  }
}
