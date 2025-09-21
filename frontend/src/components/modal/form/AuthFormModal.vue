<template>
  <div @click.self="$emit('close')" class="modal-desktop flex h-full w-full items-start justify-center pt-3">
    <div class="flex pt-20">
      <AuthForm
        :title="isLoginMode ? '用户登录' : '用户注册'"
        :submit-text="isLoginMode ? '登录' : '注册'"
        :is-login="isLoginMode"
        @submit="handleSubmit"
        @toggle-mode="handleToggleMode"
        @forgot-password="handleForgotPassword"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import AuthForm from '@/components/common/AuthForm.vue'
import { useMessage } from '@/composables/useMessage'
import useUserStore from '@/stores/userUserStore'

const userStore = useUserStore()
const message = useMessage()
const router = useRouter()
const route = useRoute()

// 通过路由查询参数判断是否为登录模式
const isLoginMode = computed(() => {
  // 优先检查查询参数中的 modal 类型
  if (route.query.modal) {
    return route.query.modal === 'login'
  }
  // 如果没有查询参数，根据当前路由路径判断
  return route.path.includes('/login') || route.path === '/'
})

// 统一的表单提交处理
const handleSubmit = async (formData: { email: string; password: string; code: string }) => {
  if (isLoginMode.value) {
    await handleLogin(formData)
  } else {
    await handleRegister(formData)
  }
}

// 登录处理
const handleLogin = async (formData: { email: string; password: string; code: string }) => {
  try {
    await userStore.login(formData)
    message.success('登录成功')

    const query = { ...route.query }
    delete query.modal
    await router.replace({ path: route.path, query })

    window.location.reload()
  } catch (err: any) {
    message.error(err.message || '发生了一个意料之外的错误')
  }
}

// 注册处理
const handleRegister = async (formData: { email: string; password: string; code: string }) => {
  try {
    await userStore.register(formData)
    message.success('注册成功！正在跳转...')

    const query = { ...route.query }
    delete query.modal
    await router.replace({ path: route.path, query })

    setTimeout(() => {
      window.location.reload()
    }, 1500)
  } catch (err: any) {
    message.error(err.message || '注册失败，请稍后再试')
  }
}

// 切换登录/注册模式
const handleToggleMode = () => {
  const newModalType = isLoginMode.value ? 'register' : 'login'
  router.push({
    path: route.path,
    query: {
      ...route.query,
      modal: newModalType,
    },
  })
}

const handleForgotPassword = () => {
  message.info('该功能正在火速开发中...🚀')
}
</script>
