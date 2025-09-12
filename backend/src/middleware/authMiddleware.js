import { verifyAccessToken } from '../utils/index.js'

export const protectAuthRoute = (req, res, next) => {
  const authHeader = req.headers.authorization
  const accessToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (!accessToken) {
    return res.status(401).json({ message: 'authMiddleware: 访问令牌缺失' })
  }

  try {
    const userId = verifyAccessToken(accessToken)

    if (!userId) {
      return res.status(401).json({ message: 'authMiddleware: 访问令牌无效' })
    }

    req.user = { id: userId }
    next()
  } catch (error) {
    // 如果是 Token 无效或已过期 ，返回特殊的错误码让前端知道需要刷新token
    if (error.message.includes('Token 无效或已过期')) {
      return res.status(401).json({
        message: 'authMiddleware: 访问令牌已过期或无效',
        code: 'TOKEN_EXPIRED',
      })
    }
    return res.status(401).json({ message: 'authMiddleware: 用户未认证请重新登录' })
  }
}
