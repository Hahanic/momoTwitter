import User from '../db/model/User.js'
import { sendResponse, generateToken, setTokenCookie } from '../utils/index.js'

export const getCurrentUser = async (req, res) => {
  const userId = req.user.id
  const user = await User.findById(userId)

  if (!user) {
    return sendResponse(res, 404, '用户未找到')
  }

  const userToReturn = user.toObject()
  delete userToReturn.password

  sendResponse(res, 200, '获取用户信息成功', userToReturn)
}

export const login = async (req, res) => {
  const { email, password } = req.body

  // 检查输入
  if (!email || !password) {
    return sendResponse(res, 400, '邮箱和密码不能为空')
  }

  // 查找用户并验证密码
  const user = await User.findOne({ email }).select('+password')
  const isPasswordCorrect = user && user.password === password

  if (!isPasswordCorrect) {
    return sendResponse(res, 401, '账户或密码错误')
  }

  // 生成token并设置cookie
  const userToReturn = user.toObject()
  delete userToReturn.password

  const token = generateToken(userToReturn._id)
  setTokenCookie(res, token)

  sendResponse(res, 200, '登录成功', { user: userToReturn })
}

export const register = async (req, res) => {
  const { email, password, emailcode } = req.body

  // 检查是否已注册
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return sendResponse(res, 409, '当前邮箱已被注册')
  }

  // 创建新用户
  const username = email.split('@')[0]
  const newUser = new User({
    username,
    displayName: username,
    email,
    password,
  })

  await newUser.save()

  const userToReturn = newUser.toObject()
  delete userToReturn.password

  // 生成token并设置cookie
  const token = generateToken(userToReturn._id)
  setTokenCookie(res, token)

  sendResponse(res, 201, '注册成功', { user: userToReturn })
}

export const logout = async (req, res) => {
  res.clearCookie('token')
  sendResponse(res, 200, '登出成功')
}

export const getIdentifyingCode = (req, res) => {
  const chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  sendResponse(res, 200, '成功', { code: result })
}
