<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="relative w-[400px] max-w-[90%] rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <h1 class="text-center text-2xl font-bold text-gray-800 dark:text-gray-100">用户登录</h1>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- 邮箱输入框 -->
        <div class="relative">
          <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-300">账号</label>
          <div class="relative mt-1">
            <input
              id="email"
              v-model="formValue.email"
              name="username"
              type="email"
              autocomplete="username"
              placeholder="请输入邮箱"
              class="w-full rounded-md border p-3 text-gray-800 transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              :class="{ 'border-red-500': errors.email }"
              @blur="validateField('email')"
            />
            <button
              v-if="formValue.email"
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              @click="formValue.email = ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
        </div>

        <!-- 密码输入框 -->
        <div class="relative">
          <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">密码</label>
          <div class="relative mt-1">
            <input
              id="password"
              v-model="formValue.password"
              name="current-password"
              :type="passwordFieldType"
              autocomplete="current-password"
              placeholder="请输入密码"
              class="w-full rounded-md border p-3 text-gray-800 transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              :class="{ 'border-red-500': errors.password }"
              @blur="validateField('password')"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              @click="togglePasswordVisibility"
            >
              <svg
                v-if="passwordFieldType === 'password'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fill-rule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zM9 4.803A7.968 7.968 0 0110 5c3.517 0 6.467 2.19 7.598 5.234a7.975 7.975 0 01-1.332 2.657l-1.344-1.344a4 4 0 00-5.303-5.303L9 4.803zM5 10c0-1.258.396-2.428 1.088-3.414l-1.498-1.498A10.038 10.038 0 00.458 10c1.274 4.057 5.022 7 9.542 7 1.145 0 2.24-.19 3.243-.532l-1.72-1.72A4 4 0 015 10z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
        </div>

        <!-- 验证码 -->
        <div class="relative">
          <div class="flex items-start gap-2">
            <button
              type="button"
              class="h-12 w-28 flex-shrink-0 rounded-md bg-gray-200 text-sm text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              @click="getCodethrottle"
            >
              <span>{{ generatedCode || '获取验证码' }}</span>
            </button>
            <input
              v-model="formValue.recieveCode"
              type="text"
              placeholder="请输入验证码"
              class="w-full rounded-md border p-3 text-gray-800 transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              :class="{ 'border-red-500': errors.recieveCode }"
              @blur="validateField('recieveCode')"
            />
          </div>
          <p v-if="errors.recieveCode" class="mt-1 text-xs text-red-500">{{ errors.recieveCode }}</p>
        </div>

        <!-- 登录按钮 -->
        <div>
          <button
            type="submit"
            class="w-full rounded-md bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            登录
          </button>
        </div>
      </form>

      <div class="mt-6 flex justify-between text-sm">
        <button class="font-medium text-blue-600 hover:text-blue-500" @click="handleForgotPassword">忘记密码？</button>
        <button class="font-medium text-blue-600 hover:text-blue-500" @click="router.push('/register')">
          注册新账号
        </button>
      </div>

      <div class="absolute bottom-0 left-0 hidden translate-x-[-100%] sm:block">
        <img src="/src/assets/images/marisa.png" class="pointer-events-none w-32 select-none" />
        <btnTheme :size="'42'" class="absolute top-0 left-[-4px]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { fetchCaptcha } from '@/api/index.ts'
import btnTheme from '@/components/ui/ThemeSwitcher.vue'
import { useMessage } from '@/composables/useMessage'
import useUserStore from '@/stores/userUserStore'
import { throttle } from '@/utils/index.ts'

// --- Hooks and Stores ---
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const message = useMessage()

onMounted(() => {
  if (route.query.redirectReason === 'unauthenticated') {
    message.error('未登录或状态过期，请重新登录')
  }
})

// --- 表单数据 ---
const formValue = reactive({
  email: '',
  password: '',
  recieveCode: '',
})

// --- 密码可见性 ---
const passwordFieldType = ref<'password' | 'text'>('password')
const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}

// --- 验证码逻辑 ---
const generatedCode = ref<string>('')
const btnCreateCode = async function () {
  try {
    const res = await fetchCaptcha()
    generatedCode.value = res.code
  } catch (err) {
    generatedCode.value = ''
    message.error('获取验证码失败')
  }
}
const getCodethrottle = throttle(btnCreateCode, 2000)

// --- 自定义表单验证系统 ---
const errors = reactive({
  email: '',
  password: '',
  recieveCode: '',
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入有效的邮箱地址',
    },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 4, message: '密码至少需要4个字符' },
    {
      validator: (value: string) => {
        const allowedCharsRegex = /^[a-zA-Z0-9!@#$%^&*()-_+=\[\]{}|;:,.<>/?]*$/
        if (!allowedCharsRegex.test(value)) {
          return '密码包含不允许的字符。'
        }
        return true
      },
    },
  ],
  recieveCode: [
    {
      validator: (value: string) => {
        if (!generatedCode.value) return '请先获取验证码'
        if (!value) return '请填写验证码'
        if (value.toLowerCase() !== generatedCode.value.toLowerCase()) {
          return '验证码不正确'
        }
        return true
      },
    },
  ],
}

type FieldName = keyof typeof formValue

// 单个字段验证
const validateField = (field: FieldName) => {
  const fieldRules = rules[field]
  for (const rule of fieldRules) {
    const value = formValue[field]
    if ('required' in rule && rule.required && !value) {
      errors[field] = rule.message
      return false
    }
    if ('pattern' in rule && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message
      return false
    }
    if ('min' in rule && rule.min && value.length < rule.min) {
      errors[field] = rule.message
      return false
    }
    if ('validator' in rule) {
      const result = rule.validator?.(value)
      if (typeof result === 'string') {
        errors[field] = result
        return false
      }
    }
  }
  errors[field] = ''
  return true
}

// 整个表单验证
const validate = () => {
  let isValid = true
  for (const field in formValue) {
    if (!validateField(field as FieldName)) {
      isValid = false
    }
  }
  return isValid
}

// --- 事件处理 ---
const handleLogin = async () => {
  if (!validate()) {
    return
  }
  try {
    await userStore.login(formValue)
    message.success('登录成功')
    // 跳转到 /home 并刷新页面
    await router.push('/home')
    window.location.reload()
    generatedCode.value = ''
  } catch (err: any) {
    message.error(err.message || '发生了一个意料之外的错误')
  }
}

const handleForgotPassword = () => {
  // router.push('/forgot-password')
  message.info('该功能正在火速开发中...🚀')
}
</script>
