import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { userRegister, userLogin } from '@/api/index.ts'
import { type UserProfile, type userLoginData, type userRegisterData  } from "@/types"
import { useRouter } from "vue-router"

const USER_STORAGE_KEY = 'user_profile'
const TOKEN_STORAGE_KEY = 'auth_token'

const useUserStore = defineStore('user', () => {
  const router = useRouter()
  // 用户基本信息
  const user = ref<UserProfile  | null>(null)
  const token = ref<string | null>(null)
  // 用户当前状态
  const isLogining = ref<boolean>(false)
  const isRegistering = ref<boolean>(false)
  // 判断用户是否登录
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  // 保存用户信息
  function setUserAndToken(userData: UserProfile , userToken: string) {
    user.value = userData
    token.value = userToken
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
    localStorage.setItem(TOKEN_STORAGE_KEY, userToken)
  }
  // 登录方法
  async function login (params: userLoginData) {
    try {
      isLogining.value = true
      const res: any = await userLogin(params)
      const userData = res.user
      const userToken = 'mockToken'
      if (!res.user || !userToken) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUserAndToken(userData, userToken)
      router.push('/')
    } catch (err) {
      console.error('登录失败', err)
      throw err
    } finally {
      isLogining.value = false
    }
  }
  // 注册方法
  async function register (params: userRegisterData) {
    try {
      isRegistering.value = true
      const res: any = await userRegister(params)
      const userData = res.user
      const userToken = 'mockToken'
      if (!res.user || !userToken) {
        throw new Error('从服务器返回的数据格式不正确')
      }
      setUserAndToken(userData, userToken)
      router.push('/')
    } catch (err) {
      console.error('注册失败', err)
      throw err
    } finally {
      isRegistering.value = false
    }
  }
  // 登出方法
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    // 跳转到登录页，并重新加载页面以清空所有状态
    router.push('/login').then(() => {
        window.location.reload()
    })
  }
  // 在 store 初始化时，尝试从 localStorage 恢复状态
  // 这确保了用户刷新页面后，登录状态不会丢失
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser)
      token.value = storedToken
  }

  return {
    user,
    token,
    isAuthenticated,
    isLogining,
    setUserAndToken,
    login,
    register,
    logout
  }
})

export default useUserStore