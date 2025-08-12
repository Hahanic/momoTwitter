export const validatePostCreation = (req, res, next) => {
  const { content, postType } = req.body

  if (!content?.trim()) {
    return res.status(400).json({ message: '帖子内容不能为空' })
  }

  if (!postType) {
    return res.status(400).json({ message: '帖子类型不能为空' })
  }

  if (!['standard', 'reply', 'quote', 'retweet'].includes(postType)) {
    return res.status(400).json({ message: '无效的帖子类型' })
  }

  if (content.length > 1000) {
    return res.status(400).json({ message: '帖子内容不能超过1000字符' })
  }

  next()
}

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: '邮箱和密码不能为空' })
  }

  // 简单的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: '邮箱格式不正确' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: '密码长度不能少于6位' })
  }

  next()
}

export const validateRegister = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: '邮箱和密码不能为空' })
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: '邮箱格式不正确' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: '密码长度不能少于6位' })
  }

  next()
}
