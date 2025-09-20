<template>
  <AuthForm
    title="用户登录"
    submit-text="登录"
    :is-login="true"
    @submit="handleLogin"
    @toggle-mode="router.push('/register')"
    @forgot-password="handleForgotPassword"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import AuthForm from '@/components/common/AuthForm.vue'
import { useMessage } from '@/composables/useMessage'
import useUserStore from '@/stores/userUserStore'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const message = useMessage()

onMounted(() => {
  if (route.query.redirectReason === 'unauthenticated') {
    message.error('状态过期，请重新登录')
  }
})

const handleLogin = async (formData: { email: string; password: string; code: string }) => {
  try {
    await userStore.login(formData)
    message.success('登录成功')
    // 跳转到 /home 并刷新页面
    await router.push('/home')
    window.location.reload()
  } catch (err: any) {
    message.error(err.message || '发生了一个意料之外的错误')
  }
}

const handleForgotPassword = () => {
  // router.push('/forgot-password')
  message.info('该功能正在火速开发中...🚀')
}
</script>
