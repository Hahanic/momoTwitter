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
  followUserAPI,
  unfollowUserAPI,
} from '@/api/index.ts'
import { useUserPostStore } from '@/stores'
import { type UserProfile, type LoginPayload, type RegisterPayload } from '@/types'

const useUserStore = defineStore(
  'user',
  () => {
    const userPostStore = useUserPostStore()

    // state
    const user = ref<UserProfile | null>(null)
    const accessToken = ref<string | null>(null)

    // 用户当前状态
    const isLogining = ref<boolean>(false)
    const isRegistering = ref<boolean>(false)
    // 判断用户是否登录
    const isAuthenticated = computed(() => !!user.value && !!accessToken.value)

    // 自主验证并刷新AccessToken
    async function ensureValidToken(): Promise<void> {
      if (!accessToken.value || !user.value) return

      let needsRefresh = false
      try {
        const payload = jwtDecode<{ exp?: number }>(accessToken.value)
        if (!payload.exp) {
          needsRefresh = true
        } else {
          const now = Math.floor(Date.now() / 1000)
          if (payload.exp - now < 120) {
            // 2分钟缓冲期
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
            accessToken.value = newAccessToken
            console.log('AccessToken 刷新成功')
          } else {
            throw new Error('Refresh API did not return an access token.')
          }
        } catch (refreshError) {
          console.error('Failed to refresh token. Logging out.', refreshError)
          await logout()
        }
      }
    }

    // 检查/更新用户登录信息
    async function checkCurrentUser() {
      try {
        const res = await fetchCurrentUser()
        if (!res) {
          throw new Error('从服务器返回的数据格式不正确')
        }
        user.value = res.userProfile
      } catch (err: any) {
        user.value = null
        console.error('获取当前用户信息失败:', err.message)
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
        user.value = userData
        accessToken.value = res.accessToken
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
        user.value = userData
        accessToken.value = res.accessToken
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
        await logoutUser()
      } catch (err) {
        throw err
      } finally {
        user.value = null
        accessToken.value = null
        location.reload()
      }
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
        user.value = res.userProfile
        if (isSelf) {
          currentUserProfile.value = res.userProfile
        }
      } catch (err) {
        throw err
      }
    }

    // 关注关注用户
    async function follow(username: string) {
      if (isAuthenticated.value === false) {
        throw new Error('请先登录')
      }
      if (isSelf.value) return
      if (!currentUserProfile.value) return
      try {
        const res = await followUserAPI(username)
        if (!res) {
          throw new Error('从服务器返回的数据格式不正确')
        }
        isFollowing.value = res.isFollowing
        if (currentUserProfile.value.username === username) {
          currentUserProfile.value.stats.followersCount!++
        }
      } catch (err) {
        throw err
      }
    }

    // 取消关注用户
    async function unfollow(username: string) {
      if (isAuthenticated.value === false) {
        throw new Error('请先登录')
      }
      if (isSelf.value) return
      if (!currentUserProfile.value) return
      try {
        const res = await unfollowUserAPI(username)
        if (!res) {
          throw new Error('从服务器返回的数据格式不正确')
        }
        isFollowing.value = res.isFollowing
        if (currentUserProfile.value.username === username) {
          currentUserProfile.value.stats.followersCount!--
        }
      } catch (err) {
        throw err
      }
    }

    // Token 管理方法
    function setAccessToken(token: string | null) {
      accessToken.value = token
    }

    function getAccessToken() {
      return accessToken.value
    }

    function removeAccessToken() {
      accessToken.value = null
    }

    // 用户信息管理方法
    function setUser(userData: UserProfile | null) {
      user.value = userData
    }

    return {
      // 状态
      user,
      accessToken,
      isAuthenticated,
      isLogining,

      // Token 管理
      setAccessToken,
      getAccessToken,
      removeAccessToken,

      // 用户信息管理
      setUser,

      // 用户操作
      checkCurrentUser,
      fetchUserProfile,
      updateUserProfile,
      currentUserProfile,
      ensureValidToken,
      follow,
      unfollow,
      isFollowing,
      isSelf,
      isLoading,
      login,
      register,
      logout,
    }
  },
  {
    persist: [
      {
        pick: ['user', 'accessToken'],
        storage: localStorage,
      },
    ],
  }
)

export default useUserStore
