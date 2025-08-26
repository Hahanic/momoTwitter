import { uploadImage, uploadImages } from '@/api'

export type MediaType = 'image' | 'video' | 'gif'

export interface UploadedMedia {
  type: MediaType
  url: string
}

/**
 * 统一上传图片（单图/多图），返回标准化的媒体数据
 */
export async function handleFileUpload(files: File[]): Promise<UploadedMedia[]> {
  if (!files || files.length === 0) return []

  if (files.length === 1) {
    const formData = new FormData()
    formData.append('image', files[0])

    try {
      const res = await uploadImage(formData)
      return [
        {
          type: 'image',
          url: res.relativePath,
        },
      ]
    } catch (e: any) {
      throw new Error(e?.message || '图片上传失败')
    }
  }

  // 多张
  const formData = new FormData()
  for (const f of files) formData.append('images', f)

  try {
    const res = await uploadImages(formData)
    return res.files.map((file: { relativePath: string }) => ({
      type: 'image' as const,
      url: file.relativePath,
    }))
  } catch (e: any) {
    throw new Error(e?.message || '批量上传失败，请稍后重试')
  }
}
