import jwt from 'jsonwebtoken'

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

// 生成刷新令牌 (30天)
export const generateRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}
export const verifyRefreshToken = (token) => {
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.sessionId
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new Error('Token 无效或已过期')
    }
    throw error
  }
}

// 生成访问令牌
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

export const verifyAccessToken = (token) => {
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
