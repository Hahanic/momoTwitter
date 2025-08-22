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
    maxAge: 24 * 60 * 60 * 1000, // 24小时
  })
}

// 将相对路径转换为完整URL
export const getFullUrl = (relativePath, req) => {
  if (!relativePath) return null

  // 如果已经是完整URL，直接返回
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }

  // 构建完整URL
  const baseUrl = process.env.FILE_BASE_URL || `${req.protocol}://${req.get('Host')}`
  return `${baseUrl}${relativePath.startsWith('/') ? relativePath : '/' + relativePath}`
}

// 批量转换媒体URL（用于帖子数据）
export const transformMediaUrls = (mediaArray, req) => {
  if (!Array.isArray(mediaArray)) return mediaArray

  return mediaArray.map((media) => ({
    ...media,
    url: getFullUrl(media.url, req),
  }))
}
