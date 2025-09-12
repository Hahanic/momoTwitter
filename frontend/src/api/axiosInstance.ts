import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { refreshAccessToken } from './auth.ts'

import { useUserStore } from '@/stores'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000, // 60秒
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// 标记是否正在刷新token
let isRefreshingToken = false
// 存储在刷新token期间收到的请求
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 请求拦截器 (Request Interceptor)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    // 将 AccessToken 放到请求头
    if (userStore.isAuthenticated) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}`
    }
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 (Response Interceptor)
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    // 原始请求配置
    const originalRequest = error.config

    let userFriendlyMessage = '操作失败，请稍后重试'
    // 服务区响应状态码不在 2xx 范围内
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          if (data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            // 如果 Token 正在刷新，则将请求加入队列
            if (isRefreshingToken) {
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
              })
                .then((token) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                  return axiosInstance(originalRequest)
                })
                .catch((err) => {
                  return Promise.reject(err)
                })
            }

            isRefreshingToken = true

            const userStore = useUserStore()
            originalRequest._retry = true
            console.log('未授权访问, 尝试刷新token')

            try {
              const { accessToken, user } = await refreshAccessToken()

              if (accessToken) {
                userStore.setUser(user)
                userStore.setAccessToken(accessToken)
                // 更新原始请求的Authorization头
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                // 执行挂起的请求
                processQueue(null, accessToken)
                // 重试原始请求
                return axiosInstance(originalRequest)
              }
            } catch (refreshError) {
              processQueue(refreshError, null)
              const userStore = useUserStore()
              userStore.logout()
              return Promise.reject(refreshError)
            } finally {
              // 重置刷新状态
              isRefreshingToken = false
            }
          } else {
            userFriendlyMessage = data?.message || '认证失败，请重新登录'
          }
          break
        case 403:
          // 服务器拒绝执行，可能是权限不足
          userFriendlyMessage = '您没有权限执行此操作'
          console.error('403: 权限不足')
          break
        case 404:
          // 请求的资源未找到
          userFriendlyMessage = data.message || '请求的资源未找到'
          console.error('404: Not Found...')
          break
        case 409:
          // 上传资源冲突
          userFriendlyMessage = data.message || '资源提交冲突'
          console.error(`409: 资源冲突：${data.message}`)
          break
        case 500:
          // 服务器内部错误
          userFriendlyMessage = data.message || '服务器内部错误，请联系管理员'
          console.error('500: 服务器内部错误')
          break
        default:
          userFriendlyMessage = data.message || `发生未知错误 (code: ${status})`
          console.error(`Error: ${status}${data.message}`)
      }
    } else if (error.request) {
      // 请求已发出但是没有响应
      userFriendlyMessage = '网络连接异常，请检查您的网络设置'
      console.error('网络错误:', error.request)
    } else {
      // 设置请求时触发了一个错误
      userFriendlyMessage = '请求发送失败，请检查代码'
      console.error('请求设置错误:', error.message)
    }

    // 创建新的对象，带有可读的message
    const customError = {
      message: userFriendlyMessage,
      originalError: error,
    }
    // 抛出格式化后的错误信息
    return Promise.reject(customError)
  }
)

export default axiosInstance
