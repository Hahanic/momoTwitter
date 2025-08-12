// 统一错误处理中间件
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // JWT 错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const message = 'Token 无效或已过期'
    error = { statusCode: 401, message }
  }

  // MongoDB 重复键错误
  if (err.code === 11000) {
    const message = '该资源已存在'
    error = { statusCode: 409, message }
  }

  // MongoDB 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')
    error = { statusCode: 400, message }
  }

  res.status(error.statusCode || 500).json({
    message: error.message || '服务器内部错误',
  })
}

export const notFound = (req, res, next) => {
  const error = new Error(`路径未找到 - ${req.originalUrl}`)
  res.status(404)
  next(error)
}
