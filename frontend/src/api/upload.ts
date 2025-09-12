import axiosInstance from './axiosInstance'

// 上传单张图片
export const uploadImage = (
  formData: FormData
): Promise<{
  message: string
  filename: string
  originalname: string
  size: number
  url: string
  relativePath: string
  path: string
}> => {
  return axiosInstance.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
// 上传多张图片
export const uploadImages = (
  formData: FormData
): Promise<{
  message: string
  files: Array<{
    filename: string
    originalname: string
    size: number
    url: string
    relativePath: string
    path: string
  }>
  count: number
  totalSize: number
}> => {
  return axiosInstance.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
