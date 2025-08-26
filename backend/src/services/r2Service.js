import dotenv from 'dotenv'
dotenv.config()

import crypto from 'crypto'
import path from 'path'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// 初始化 S3 客户端
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
})

/**
 * 上传文件到 Cloudflare R2
 * @param {Buffer} fileBuffer - 文件缓冲区
 * @param {string} originalname - 原始文件名
 * @param {string} mimetype - 文件的 MIME 类型
 * @returns {Promise<string>} - 返回上传后的文件公共 URL
 */
export const uploadToR2 = async (fileBuffer, originalname, mimetype) => {
  // 生成一个更安全、唯一的文件名
  const randomSuffix = crypto.randomBytes(8).toString('hex')
  const extension = path.extname(originalname)
  const filename = `${Date.now()}_${randomSuffix}${extension}`

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: filename,
    Body: fileBuffer,
    ContentType: mimetype,
  })

  try {
    await s3.send(command)
    // 拼接公共访问 URL
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${filename}`
    return publicUrl
  } catch (error) {
    console.error('❌ R2 上传失败:', error)
    throw new Error('文件上传到云存储失败。')
  }
}
