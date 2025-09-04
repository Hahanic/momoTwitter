import { UAParser } from 'ua-parser-js'

import Post from '../db/model/Post.js'
import Relationship from '../db/model/Relationship.js'
import Session from '../db/model/Session.js'
import User from '../db/model/User.js'
import {
  sendResponse,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from '../utils/index.js'

export const getCurrentUser = async (req, res) => {
  const userId = req.user.id
  const user = await User.findById(userId)

  if (!user) {
    return sendResponse(res, 404, '用户未找到')
  }
  const userToReturn = user.toObject()
  delete userToReturn.password

  sendResponse(res, 200, '获取用户信息成功', {
    userProfile: userToReturn,
  })
}

export const updateUserProfile = async (req, res) => {
  const userId = req.user.id

  const { displayName, bio, location, website, avatarUrl, bannerUrl } = req.body
  const updateFields = {}
  if (displayName !== undefined) updateFields.displayName = displayName
  if (bio !== undefined) updateFields.bio = bio
  if (location !== undefined) updateFields.location = location
  if (website !== undefined) updateFields.website = website
  if (avatarUrl) updateFields.avatarUrl = avatarUrl
  if (bannerUrl) updateFields.bannerUrl = bannerUrl

  // 如果没有任何可更新的字段，则提前返回
  if (Object.keys(updateFields).length === 0) {
    return sendResponse(res, 400, '没有需要更新的资料')
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    {
      new: true,
      runValidators: true,
    }
  ).select('-password')

  if (!updatedUser) {
    return sendResponse(res, 404, '用户未找到')
  }

  // 更新帖子作者信息
  if (updateFields.displayName || updateFields.avatarUrl || updateFields.username) {
    const postUpdatePayload = {}
    if (updateFields.displayName) {
      postUpdatePayload['authorInfo.displayName'] = updateFields.displayName
    }
    if (updateFields.avatarUrl) {
      postUpdatePayload['authorInfo.avatarUrl'] = updateFields.avatarUrl
    }

    Post.updateMany({ authorId: userId }, { $set: postUpdatePayload }).catch((err) => {
      console.error('同步更新帖子作者信息失败:', err)
    })
  }

  sendResponse(res, 200, '个人资料更新成功', {
    userProfile: updatedUser,
  })
}

export const getUserProfile = async (req, res) => {
  const { username } = req.params
  const user = await User.findOne({ username })

  if (!user) {
    return sendResponse(res, 404, '用户未找到')
  }

  const userToReturn = user.toObject()
  delete userToReturn.password

  // 如果用户登录了 则附带是否关注的信息
  const accessToken = req.headers.authorization?.split(' ')[1]
  if (accessToken) {
    try {
      const currentUserId = verifyAccessToken(accessToken)
      if (currentUserId && currentUserId.toString() === user._id.toString()) {
        return sendResponse(res, 200, '获取用户信息成功', {
          userProfile: userToReturn,
        })
      }
      if (currentUserId && currentUserId.toString() !== user._id.toString()) {
        const rel = await Relationship.exists({ follower: currentUserId, following: user._id })
        userToReturn.isFollowing = !!rel
      }
    } catch (e) {
      // 无效 token 忽略
    }
  }

  return sendResponse(res, 200, '获取用户信息成功', {
    userProfile: userToReturn,
  })
}

export const login = async (req, res) => {
  const { email, password } = req.body

  // 查找用户并验证密码
  const user = await User.findOne({ email }).select('+password')
  const isPasswordCorrect = user && user.password === password

  if (!isPasswordCorrect) {
    return sendResponse(res, 401, '账户或密码错误')
  }

  // 创建会话和令牌
  const accessToken = await createSessionAndTokens(user, req, res)

  // 生成token并设置cookie
  const userToReturn = user.toObject()
  delete userToReturn.password

  // const token = generateToken(userToReturn._id)
  // setTokenCookie(res, token)

  sendResponse(res, 200, '登录成功', { user: userToReturn, accessToken })
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

  // 创建会话和令牌
  const accessToken = await createSessionAndTokens(userToReturn, req, res)

  // 生成token并设置cookie
  // const token = generateToken(userToReturn._id)
  // setTokenCookie(res, token)

  sendResponse(res, 201, '注册成功', { user: userToReturn, accessToken })
}

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
      try {
        // 验证refreshToken并获取sessionId
        const sessionId = verifyRefreshToken(refreshToken)

        if (sessionId) {
          // 删除对应的会话记录
          await Session.findByIdAndDelete(sessionId)
        }
      } catch (error) {
        console.log('删除出错...')
      }
    }

    // 清除cookie
    res.clearCookie('token')
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    sendResponse(res, 200, '登出成功')
  } catch (error) {
    console.error('Logout error:', error)

    // 即使出错也要清理cookies
    res.clearCookie('token')
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    sendResponse(res, 200, '登出成功')
  }
}

export const getIdentifyingCode = (req, res) => {
  const chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  sendResponse(res, 200, '成功', { code: result })
}

const createSessionAndTokens = async (user, req, res) => {
  // 从请求中获取 IP 和 User-Agent
  let ipAddress = req.ip || req.connection.remoteAddress
  if (ipAddress.startsWith('::ffff:')) {
    ipAddress = ipAddress.substring(7)
  }
  const uaString = req.headers['user-agent'] || 'Unknown'
  const parser = new UAParser(uaString)
  const deviceInfo = parser.getResult()
  const userAgent = `${parser.getBrowser().name} on ${parser.getOS().name}`

  // 保存会话信息
  const session = new Session({
    userId: user._id,
    userAgent,
    ipAddress,
    deviceInfo: {
      browser: deviceInfo.browser.name,
      os: `${deviceInfo.os.name} ${deviceInfo.os.version || ''}`.trim(),
      deviceType: deviceInfo.device.type || 'desktop',
      deviceVendor: deviceInfo.device.vendor,
      deviceModel: deviceInfo.device.model,
    },
  })
  await session.save()

  // 生成双token
  const refreshToken = generateRefreshToken(session._id)
  const accessToken = generateAccessToken(user._id)

  // 只设置refreshToken到cookie，accessToken通过响应返回
  // secure: process.env.NODE_ENV === 'production',
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
  })
  return accessToken
}

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    return sendResponse(res, 401, '未提供刷新令牌')
  }

  try {
    // 验证刷新令牌
    const sessionId = verifyRefreshToken(refreshToken)
    if (!sessionId) {
      return sendResponse(res, 401, '刷新令牌无效')
    }

    // 查找会话
    const session = await Session.findById(sessionId)
    if (!session) {
      return sendResponse(res, 401, '会话已过期或不存在')
    }

    // 查找用户
    const user = await User.findById(session.userId).select('-password')
    if (!user) {
      return sendResponse(res, 401, '用户不存在')
    }

    // 生成新的访问令牌
    const accessToken = generateAccessToken(user._id)

    sendResponse(res, 200, '成功', { user, accessToken })
  } catch (error) {
    console.error('刷新令牌时出错:', error)
    sendResponse(res, 500, '服务器错误')
  }
}
