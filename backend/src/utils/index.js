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
