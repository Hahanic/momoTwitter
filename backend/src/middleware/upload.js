import crypto from 'crypto'
import { promises as fsPromises } from 'fs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import multer from 'multer'

import User from '../db/model/User.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '../../uploads') // 文件上传目录

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 1. 存储引擎配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: async (req, file, cb) => {
    try {
      console.log(`🔄 处理文件: ${file.originalname}, MIME: ${file.mimetype}`)

      // 获取用户信息
      const userId = req.user?.id || req.user?._id
      if (!userId) {
        console.error('❌ 用户ID缺失')
        return cb(new Error('用户未认证'), false)
      }

      const user = await User.findById(userId).select('username')
      if (!user) {
        console.error('❌ 用户不存在:', userId)
        return cb(new Error('用户不存在'), false)
      }

      // 生成文件名：时间戳_用户名_随机字符串.扩展名
      const timestamp = Date.now()
      const username = user.username.replace(/[^a-zA-Z0-9_-]/g, '_')
      const randomSuffix = crypto.randomBytes(8).toString('hex') // 8字节随机字符串
      const extension = path.extname(file.originalname)
      const filename = `${timestamp}_${username}_${randomSuffix}${extension}`
      // 登记即将写入的文件名，边狱异常清理
      const fullPath = path.join(uploadDir, filename)
      if (!req._pendingUploads) req._pendingUploads = new Set()
      req._pendingUploads.add(fullPath)

      console.log(`📁 生成文件名: ${filename}`)
      cb(null, filename)
    } catch (error) {
      console.error('❌ 文件名生成失败:', error)
      cb(error, false)
    }
  },
})

// 2. 文件过滤器
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true) // 接受图片文件
  } else {
    cb(new Error('只允许上传图片文件'), false) // 拒绝其他文件
  }
}

// 3. 创建 Multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 单个文件限制
    files: 4, // 最多4个文件
    parts: 10, // 增加 parts 限制
    fields: 10, // 增加 fields 限制
  },
})

export const cleanupUploadedFiles = async (req) => {
  try {
    // 防抖
    if (req._cleanupDone) {
      console.log('ℹ️ 清理已执行过，跳过')
      return
    }
    if (req._cleanupInProgress) {
      console.log('ℹ️ 清理进行中，跳过并发调用')
      return
    }
    req._cleanupInProgress = true
    // 如果连接监控已被禁用，不执行清理
    if (req.shouldMonitorConnection === false) {
      console.log('🛡️ 连接监控已禁用，跳过文件清理')
      return
    }
    const filesToClean = []
    // 上传错误，但Multer成功
    // 收集单个文件
    if (req.file && req.file.path) {
      filesToClean.push(req.file.path)
    }
    // 收集多个文件
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.path) filesToClean.push(file.path)
      })
    }
    // 上传错误，Multer为完成
    if (req._pendingUploads && req._pendingUploads.size > 0) {
      for (const p of req._pendingUploads) {
        filesToClean.push(p)
      }
    }

    if (filesToClean.length > 0) {
      console.log(
        '🗑️ 准备清理因异常中断上传的文件:',
        filesToClean.map((p) => path.basename(p))
      )
      // 使用 Promise.all 并发删除所有文件，并忽略单个文件的删除失败
      // 使用 rm(force) 避免文件已不存在导致的 ENOENT 噪音
      const results = await Promise.allSettled(filesToClean.map((filePath) => fsPromises.rm(filePath, { force: true })))
      const ok = results.filter((r) => r.status === 'fulfilled').length
      const fail = results.length - ok
      console.log(`✅ 清理完成: ${ok}/${results.length} 个文件处理成功${fail ? `，${fail} 个已不存在或失败` : ''}.`)

      // 标记完成，避免重复清理
      req._cleanupDone = true
      req.shouldMonitorConnection = false
    }
    if (req._pendingUploads) req._pendingUploads.clear()
  } catch (error) {
    console.error('❌ 清理上传文件时发生严重错误:', error)
  } finally {
    req._cleanupInProgress = false
  }
}

// 连接中断保护中间件 (处理网络异常)
export const connectionGuard = (req, res, next) => {
  // 标记连接是否应该被监控
  req.shouldMonitorConnection = true

  req.on('aborted', () => {
    if (req.shouldMonitorConnection) {
      console.log('❌ 客户端连接中断，正在清理上传文件...')
      cleanupUploadedFiles(req)
    }
  })

  req.on('close', () => {
    // 增加延迟检查，避免正常响应时的误触发
    setTimeout(() => {
      if (!res.headersSent && req.shouldMonitorConnection) {
        console.log('🧹 连接关闭但响应未发送，清理上传文件...')
        cleanupUploadedFiles(req)
      }
    }, 100) // 100ms 延迟
  })

  // 增加超时时间，给多文件上传更多时间
  req.setTimeout(60000, () => {
    // 改为60秒
    if (req.shouldMonitorConnection) {
      console.log('⏰ 上传超时，清理文件...')
      cleanupUploadedFiles(req)
      if (!res.headersSent) {
        res.status(408).json({ message: '上传超时' })
      }
    }
  })

  next()
}

// 成功响应后禁用清理（不再使用猴子补丁，监听 finish 事件）
export const disableCleanupOnSuccess = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode < 400) {
      req.shouldMonitorConnection = false
      if (req._pendingUploads) req._pendingUploads.clear()
      console.log(`✅ 响应成功 (${res.statusCode}) on 'finish' event, 禁用文件清理监控`)
    }
  })
  next()
}

// 统一错误处理中间件：捕获错误并尝试清理上传残留
export const cleanupOnErrorMiddleware = (err, req, res, next) => {
  console.error('🚨 捕获到错误，准备清理文件:', err)
  // 异步清理但不在此处结束响应，交由统一 errorHandler
  Promise.resolve(cleanupUploadedFiles(req))
    .catch((e) => console.error('清理失败(忽略并继续错误处理):', e))
    .finally(() => next(err))
}

export default upload
