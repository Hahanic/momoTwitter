// backend/src/controller/upload.js

import { uploadToR2 } from '../services/r2Service.js'
import { sendResponse } from '../utils/index.js'

export const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, '没有文件被上传')
    }

    const { buffer, originalname, mimetype, size } = req.file

    // 调用 R2 服务上传文件
    const publicUrl = await uploadToR2(buffer, originalname, mimetype)

    return sendResponse(res, 200, '图片上传成功', {
      originalname,
      size,
      // 注意：这里返回的是 R2 的完整公共 URL
      // 前端会使用这个 URL，然后发帖时将这个 URL 提交
      url: publicUrl,
      type: 'image',
    })
  } catch (error) {
    return sendResponse(res, 500, error.message || '上传失败')
  }
}

export const uploadPostImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendResponse(res, 400, '没有文件被上传')
    }
    if (req.files.length > 4) {
      return sendResponse(res, 400, '最多只能上传4张图片')
    }

    // 并发上传所有图片
    const uploadPromises = req.files.map((file) =>
      uploadToR2(file.buffer, file.originalname, file.mimetype).then((url) => ({
        originalname: file.originalname,
        size: file.size,
        url,
        type: 'image',
      }))
    )

    const uploadedFiles = await Promise.all(uploadPromises)
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0)

    return sendResponse(res, 200, `成功上传 ${uploadedFiles.length} 张图片`, {
      files: uploadedFiles,
      count: uploadedFiles.length,
      totalSize,
    })
  } catch (error) {
    return sendResponse(res, 500, error.message || '批量上传失败')
  }
}
