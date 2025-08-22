import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import multer from 'multer'

import User from '../db/model/User.js'

// 当前目录
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// 上传目录 backend/uploads
const uploadDir = path.join(__dirname, '../../uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: async (req, file, cb) => {
    try {
      const userId = req.user.id
      if (!userId) {
        return cb(new Error('用户未认证'), false)
      }
      const user = await User.findById(userId).select('username')
      if (!user) {
        return cb(new Error('用户不存在'), false)
      }
      // 生成文件名：时间戳_用户名.扩展名
      const timestamp = Date.now()
      // 清理特殊字符
      const username = user.username.replace(/[^a-zA-Z0-9_-]/g, '_')
      const fileExtension = path.extname(file.originalname)
      const filename = `${timestamp}_${username}${fileExtension}`

      cb(null, filename)
    } catch (error) {
      cb(error, false)
    }
  },
})
// 文件过滤
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件'), false)
  }
}
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

export default upload
