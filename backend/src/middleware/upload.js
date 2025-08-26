// backend/src/middleware/upload.js

import multer from 'multer'

// 1. 使用内存存储，文件将作为 Buffer 存在于 req.file.buffer
const storage = multer.memoryStorage()

// 2. 文件过滤器保持不变
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件'), false)
  }
}

// 3. 创建 Multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 4,
  },
})

export default upload
