import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  registerUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
  fetchUserByUsername,
  updateUserProfileAPI,
} from '@/api/index.ts'
import { useUserPostStore } from '@/stores'
import { type UserProfile, type LoginPayload, type RegisterPayload } from '@/types'

const USER_STORAGE_KEY = 'user_profile'

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
      const res: any = await loginUser(params)
      const userData = res.user
      if (!res.user) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUser(userData)
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
      const res: any = await registerUser(params)
      const userData = res.user
      if (!res.user) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUser(userData)
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
