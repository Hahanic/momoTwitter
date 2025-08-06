<template>
  <div class="w-full">
    <div class="flex flex-col items-center justify-center h-full">
      <h1 class="text-2xl font-bold mb-4">Account Settings</h1>
      <p class="text-gray-600">Manage your account settings here.</p>
      <button
        @click="logoutAndclear"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import useUserStore from '@/stores/user'
import { useLoadingBar, useMessage } from 'naive-ui'

const loadingBar = useLoadingBar()
const message = useMessage()

const userStore = useUserStore()

const logoutAndclear = async () => {
  loadingBar.start()
  try {
    await userStore.logout()
  } catch (error) {
    console.error('Logout failed:', error)
    loadingBar.error()
    message.error('Logout failed, please try again.')
  } finally {
    loadingBar.finish()
  }
}
</script>

<style scoped></style>
