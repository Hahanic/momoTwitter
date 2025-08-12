import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { userRegister, userLogin, userLogout, getCurrentUser } from '@/api/index.ts'
import { type UserProfile, type userLoginData, type userRegisterData } from '@/types'

const USER_STORAGE_KEY = 'user_profile'

const useUserStore = defineStore('user', () => {
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
      const res: UserProfile = await getCurrentUser()
      if (!res) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUser(res)
    } catch (err) {
      setUser(null)
      throw err
    }
  }

  // 登录方法
  async function login(params: userLoginData) {
    try {
      isLogining.value = true
      const res: any = await userLogin(params)
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
  async function register(params: userRegisterData) {
    try {
      isRegistering.value = true
      const res: any = await userRegister(params)
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
      await userLogout()
    } catch (err) {
      throw err
    } finally {
    }
  }
  // 在 store 初始化时，尝试从 localStorage 恢复状态
  // 这确保了用户刷新页面后，登录状态不会丢失
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }

  return {
    user,
    isAuthenticated,
    isLogining,
    checkCurrentUser,
    setUser,
    login,
    register,
    logout,
  }
})

export default useUserStore
