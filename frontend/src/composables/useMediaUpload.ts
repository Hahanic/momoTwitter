import { uploadImage, uploadImages } from '@/api'

export type MediaType = 'image' | 'video' | 'gif'

export interface UploadedMedia {
  type: MediaType
  url: string
}

export async function handleFileUpload(files: File[]): Promise<UploadedMedia[]> {
  if (!files || files.length === 0) return []

  if (files.length === 1) {
    const formData = new FormData()
    formData.append('image', files[0])

    try {
      const res = await uploadImage(formData)
      // res: {
      //   message: '图片上传成功'
      //   originalname: '3_8704.jpg'
      //   size: 344385
      //   type: 'image'
      //   url: 'https://pub-c11d6d29dc6849578fa22b903960e39f.r2.dev/1756217191190_21501633c574bd2f.jpg'
      // }
      return [
        {
          type: 'image',
          url: res.url,
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
    return res.files.map((file) => ({
      type: 'image' as const,
      url: file.url,
    }))
  } catch (e: any) {
    throw new Error(e?.message || '批量上传失败，请稍后重试')
  }
}
