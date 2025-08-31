import Post from '../db/model/Post.js'
import Relationship from '../db/model/Relationship.js'
import User from '../db/model/User.js'
import { sendResponse, generateToken, setTokenCookie, verifyUserToken } from '../utils/index.js'

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
  const token = req.cookies.token
  if (token) {
    try {
      const currentUserId = verifyUserToken(token)
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
