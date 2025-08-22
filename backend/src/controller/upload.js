import { sendResponse, getFullUrl } from '../utils/index.js'

export const uploadPostImage = (req, res) => {
  try {
    // 检查是否有文件上传
    if (!req.file) {
      return sendResponse(res, 400, '没有文件被上传')
    }

    // 数据库存储的相对路径
    const relativePath = `/uploads/${req.file.filename}`

    // 返回给前端的完整URL
    const fullUrl = getFullUrl(relativePath, req)

    return sendResponse(res, 200, '图片上传成功', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      url: fullUrl, // 前端使用的完整URL
      relativePath: relativePath, // 数据库存储的相对路径 (可选，调试用)
      path: req.file.path,
    })
  } catch (error) {
    return sendResponse(res, 500, '上传失败', { error: error.message })
  }
}

export const uploadPostImages = (req, res) => {
  try {
    // 检查是否有文件上传
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return sendResponse(res, 400, '没有文件被上传')
    }

    // 检查文件数量限制
    if (req.files.length > 4) {
      return sendResponse(res, 400, '最多只能上传4张图片')
    }

    // 处理每个上传的文件
    const uploadedFiles = req.files.map((file) => {
      const relativePath = `/uploads/${file.filename}`
      const fullUrl = getFullUrl(relativePath, req)

      return {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        url: fullUrl, // 前端使用的完整URL
        relativePath: relativePath, // 数据库存储的相对路径
        path: file.path,
      }
    })

    // 计算总文件大小（可选的统计信息）
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0)

    return sendResponse(res, 200, `成功上传 ${uploadedFiles.length} 张图片`, {
      files: uploadedFiles,
      count: uploadedFiles.length,
      totalSize: totalSize,
    })
  } catch (error) {
    return sendResponse(res, 500, '批量上传失败', { error: error.message })
  }
}
