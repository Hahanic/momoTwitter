<template>
  <AuthForm
    title="用户注册"
    submit-text="注册"
    :is-login="false"
    @submit="handleRegister"
    @toggle-mode="router.push('/login')"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import AuthForm from '@/components/common/AuthForm.vue'
import { useMessage } from '@/composables/useMessage'
import useUserStore from '@/stores/userUserStore'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const handleRegister = async (formData: { email: string; password: string; code: string }) => {
  try {
    await userStore.register(formData)
    message.success('注册成功！正在跳转到登录页...')
    setTimeout(() => {
      router.push('/home')
    }, 1500)
  } catch (err: any) {
    message.error(err.message || '注册失败，请稍后再试')
  }
}
</script>
