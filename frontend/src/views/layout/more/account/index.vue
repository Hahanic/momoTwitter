<template>
  <div class="dark:border-borderDark border-borderWhite mt-3 w-full border-t-1 pt-3">
    <!-- 用户信息 -->
    <div v-if="userStore.isAuthenticated">
      <div class="flex h-[6rem] items-center">
        <img :src="userStore.user?.avatarUrl || '/myAvatar.jpg'" class="h-full w-[6rem] rounded-full object-cover" />
        <div class="ml-4 flex h-full flex-col justify-center">
          <span>{{ userStore.user?.displayName }}</span>
          <span>@{{ userStore.user?.username }}</span>
        </div>
      </div>

      <button
        class="rounded bg-[#d4237a] px-4 py-2 text-white transition-colors hover:bg-[#a11a5b]"
        @click="logoutAndclear"
      >
        退出登录
      </button>
    </div>
    <div v-else>
      <button
        class="rounded bg-[#d4237a] px-4 py-2 text-white transition-colors hover:bg-[#a11a5b]"
        @click="router.push('/login')"
      >
        点击登录
      </button>
    </div>
  </div>
  <!-- <div class="w-full border">
    <div class="flex h-full flex-col items-center justify-center">
      <h1 class="mb-4 text-2xl font-bold">Account Settings</h1>
      <p class="text-gray-600">Manage your account settings here.</p>
      <button @click="logoutAndclear" class="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        Logout
      </button>
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { useLoadingBar, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'

import useUserStore from '@/stores/userUserStore'

const router = useRouter()
const loadingBar = useLoadingBar()
const message = useMessage()

const userStore = useUserStore()

const logoutAndclear = async () => {
  loadingBar.start()
  try {
    await userStore.logout()
    message.success('已退出登录')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    loadingBar.error()
  } finally {
    loadingBar.finish()
  }
}
</script>

<style scoped></style>
