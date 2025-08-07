<template>
  <div class="w-full">
    <div class="flex h-full flex-col items-center justify-center">
      <h1 class="mb-4 text-2xl font-bold">Account Settings</h1>
      <p class="text-gray-600">Manage your account settings here.</p>
      <button @click="logoutAndclear" class="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import useUserStore from '@/stores/user'
import { useLoadingBar, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'

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
