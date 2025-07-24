import axios, {type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, //10秒
  headers: {
    'Content-Type': 'application/json',
  }
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('请求拦截器', config)

    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 3. 响应拦截器 (Response Interceptor)
axiosInstance.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    let userFriendlyMessage = '操作失败，请稍后重试'
    // 服务区响应状态码不在 2xx 范围内
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // 通常是 token 失效，重定向到登录页
          userFriendlyMessage = data.message || '认证失败，请重新登录';
          console.error('401: 重定向到登录页...');
          // window.location.href = '/login';
          break;
        case 403:
          // 服务器拒绝执行，可能是权限不足
          userFriendlyMessage = '您没有权限执行此操作';
          console.error('403: 权限不足');
          break;
        case 404:
          // 请求的资源未找到
          userFriendlyMessage = '请求的资源未找到';
          console.error('404: Not Found...');
          break;
        case 409:
          // 上传资源冲突
          userFriendlyMessage = data.message || '资源提交冲突'; 
          console.error(`409: 资源冲突：${data.message}`);
          break;
        case 500:
          // 服务器内部错误
          userFriendlyMessage = '服务器内部错误，请联系管理员';
          console.error('500: 服务器内部错误');
          break;
        default:
          userFriendlyMessage = data.message || `发生未知错误 (code: ${status})`;
          console.error(`Error: ${status}${data.message}`);
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
      originalError: error
    }
    // 抛出格式化后的错误信息
    return Promise.reject(customError)
  }
);

// 4. 导出实例
export default axiosInstance;