import jwt from 'jsonwebtoken'

// 验证用户token并返回用户ID
export const verifyUserToken = (token) => {
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.userId
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new Error('Token 无效或已过期')
    }
    throw error
  }
}

// 解析并验证游标
export const parseCursor = (cursor) => {
  if (!cursor) return null

  const parsedCursor = new Date(cursor)
  if (isNaN(parsedCursor.getTime())) {
    throw new Error('无效的游标格式')
  }
  return parsedCursor
}

// 统一响应格式
export const sendResponse = (res, statusCode = 200, message = '成功', data = null) => {
  const response = { message }
  if (data !== null) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(response, data)
    } else {
      response.data = data
    }
  }
  return res.status(statusCode).json(response)
}

// 生成 JWT Token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' })
}

// 设置安全的 cookie
export const setTokenCookie = (res, token) => {
  return res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000 * 3, // 72小时
  })
}
