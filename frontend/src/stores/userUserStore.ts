import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  registerUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
  fetchUserByUsername,
  updateUserProfileAPI,
  refreshAccessToken,
} from '@/api/index.ts'
import { useUserPostStore } from '@/stores'
import { type UserProfile, type LoginPayload, type RegisterPayload } from '@/types'

const USER_STORAGE_KEY = 'user_profile'
const USER_STORAGE_ACCESS_KEY = 'access_token'

const useUserStore = defineStore('user', () => {
  const userPostStore = useUserPostStore()
  // 用户基本信息
  const user = ref<UserProfile | null>(null)
  // 用户当前状态
  const isLogining = ref<boolean>(false)
  const isRegistering = ref<boolean>(false)
  // 判断用户是否登录
  const isAuthenticated = computed(() => !!user.value)
  // 保存用户信息
  function setUser(userData: UserProfile | null) {
    user.value = userData
    if (userData) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }
  // 保存访问令牌AccessToken
  function setAccessToken(accessToken: string) {
    localStorage.setItem(USER_STORAGE_ACCESS_KEY, accessToken)
  }
  // 获取当前的accessToken
  function getAccessToken(): string | null {
    return localStorage.getItem(USER_STORAGE_ACCESS_KEY)
  }

  // 删除访问令牌
  function removeAccessToken() {
    localStorage.removeItem(USER_STORAGE_ACCESS_KEY)
  }

  async function ensureValidToken(): Promise<void> {
    const token = getAccessToken()
    if (!token || !user.value) return

    let needsRefresh = false
    try {
      const payload = jwtDecode<{ exp?: number }>(token)
      if (!payload.exp) {
        needsRefresh = true
      } else {
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp - now < 300) {
          // 5分钟缓冲期
          needsRefresh = true
        }
      }
    } catch {
      needsRefresh = true
    }

    if (needsRefresh) {
      try {
        const response = await refreshAccessToken()
        const newAccessToken = response.accessToken
        if (newAccessToken) {
          setAccessToken(newAccessToken)
          console.log('Token refreshed proactively.')
        } else {
          throw new Error('Refresh API did not return an access token.')
        }
      } catch (refreshError) {
        console.error('Failed to refresh token. Logging out.', refreshError)
        await logout()
      }
    }
  }

  async function initialize() {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    const token = getAccessToken()

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))

      // 应用启动时立即检查一次 token 有效性
      await ensureValidToken()

      // 设置事件监听器，实现混合刷新策略
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          ensureValidToken()
        }
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange) // 先移除，防止重复监听
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  // 检查/更新用户登录信息
  async function checkCurrentUser() {
    try {
      const res = await fetchCurrentUser()
      if (!res) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUser(res.userProfile)
    } catch (err) {
      setUser(null)
      throw err
    }
  }

  // 登录方法
  async function login(params: LoginPayload) {
    try {
      isLogining.value = true
      const res = await loginUser(params)
      const userData = res.user
      if (!res.user) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUser(userData)
      setAccessToken(res.accessToken)
    } catch (err) {
      throw err
    } finally {
      isLogining.value = false
    }
  }
  // 注册方法
  async function register(params: RegisterPayload) {
    try {
      isRegistering.value = true
      const res = await registerUser(params)
      const userData = res.user
      if (!res.user) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUser(userData)
      setAccessToken(res.accessToken)
    } catch (err) {
      throw err
    } finally {
      isRegistering.value = false
    }
  }
  // 登出方法
  async function logout() {
    try {
      user.value = null
      localStorage.removeItem(USER_STORAGE_KEY)
      await logoutUser()
    } catch (err) {
      throw err
    } finally {
      setUser(null)
      removeAccessToken()
    }
  }
  // 在 store 初始化时，尝试从 localStorage 恢复状态
  // 保证用户刷新页面后，登录状态不会丢失
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }

  // profile页面用户信息的状态
  const currentUserProfile = ref<UserProfile | null>(null)
  const isFollowing = ref<boolean>(false)
  const isSelf = computed(() => {
    return currentUserProfile.value?.username === user.value?.username
  })
  const isLoading = ref(false)

  // 获取用户信息
  async function fetchUserProfile(username: string) {
    isLoading.value = true
    try {
      // 清空上一次用户帖子相关数据
      userPostStore.resetAll()
      const res = await fetchUserByUsername(username)
      currentUserProfile.value = res.userProfile
      isFollowing.value = !!res.userProfile.isFollowing
    } catch (err) {
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // 用户更新信息
  async function updateUserProfile(profileData: Partial<UserProfile>) {
    try {
      const res = await updateUserProfileAPI(profileData)
      if (!res) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUser(res.userProfile)
      if (isSelf) {
        currentUserProfile.value = res.userProfile
      }
    } catch (err) {
      throw err
    }
  }

  return {
    user,
    isAuthenticated,
    isLogining,
    checkCurrentUser,
    fetchUserProfile,
    updateUserProfile,
    currentUserProfile,
    initialize,
    setAccessToken,
    removeAccessToken,
    getAccessToken,
    ensureValidToken,
    isFollowing,
    isSelf,
    isLoading,
    setUser,
    login,
    register,
    logout,
  }
})

export default useUserStore
