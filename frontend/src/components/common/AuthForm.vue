<template>
  <div class="flex h-full w-full items-center justify-center">
    <div
      class="dark:border-borderDark border-borderWhite relative rounded-xl bg-white p-7 shadow-lg dark:border-1 dark:bg-black"
    >
      <h1 class="text-center text-2xl font-bold text-gray-800 dark:text-gray-100">{{ title }}</h1>

      <form @submit.prevent="handleSubmit" class="mt-6 space-y-8 text-gray-600 dark:text-gray-300">
        <!-- 邮箱输入框 -->
        <div class="relative">
          <div class="relative">
            <input
              id="email"
              type="email"
              name="email"
              autocomplete="email"
              v-model="formValue.email"
              placeholder="请输入邮箱"
              class="dark:border-borderDark w-full border-b-1 p-3 transition-colors outline-none focus:border-blue-500"
              :class="{ 'border-red-500 dark:border-red-500': errors.email }"
              @blur="validateField('email')"
            />
            <Mail class="absolute inset-y-0 right-0 m-3 h-5 w-5 text-gray-400" />
          </div>
          <div v-if="errors.email" class="absolute pl-3 text-[0.9rem] font-light text-red-500">
            {{ errors.email }}
          </div>
        </div>

        <!-- 密码输入框 -->
        <div class="relative">
          <div class="relative">
            <input
              id="password"
              :type="passwordFieldType"
              name="new-password"
              autocomplete="new-password"
              v-model="formValue.password"
              placeholder="请输入密码"
              class="dark:border-borderDark w-full border-b-1 p-3 transition-colors outline-none focus:border-blue-500"
              :class="{ 'border-red-500 dark:border-red-500': errors.password }"
              @blur="validateField('password')"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              @click="togglePasswordVisibility"
            >
              <Eye v-if="passwordFieldType !== 'password'" class="h-5 w-5" />
              <EyeOff v-else class="h-5 w-5" />
            </button>
          </div>
          <div v-if="errors.password" class="absolute pl-3 text-[0.9rem] font-light text-red-500">
            {{ errors.password }}
          </div>
        </div>

        <!-- 邮箱验证码输入框 -->
        <div v-if="isLogin" class="relative">
          <div class="flex items-center gap-2">
            <input
              id="email-verification-code"
              type="text"
              name="email-verification-code"
              v-model="formValue.code"
              placeholder="请输入验证码"
              class="dark:border-borderDark w-full border-b-1 p-3 transition-colors outline-none focus:border-blue-500"
              :class="{ 'border-red-500 dark:border-red-500': errors.code }"
              @blur="validateField('code')"
            />
            <button
              type="button"
              class="h-10 w-[70px] flex-shrink-0 rounded-md text-sm transition-colors hover:cursor-pointer hover:text-blue-300 dark:text-gray-200"
              @click="getCodeThrottle"
            >
              <span v-if="!generatedCode">获取验证码</span>
              <span v-else>{{ generatedCode }}</span>
            </button>
          </div>
          <div v-if="errors.code" class="absolute pl-3 text-[0.9rem] font-light text-red-500">
            {{ errors.code }}
          </div>
        </div>
        <div v-else class="relative">
          <div class="flex items-center gap-2">
            <input
              id="email-verification-code"
              type="text"
              name="email-verification-code"
              v-model="formValue.code"
              placeholder="请输入邮箱验证码"
              class="dark:border-borderDark w-full border-b-1 p-3 transition-colors outline-none focus:border-blue-500"
              :class="{ 'border-red-500 dark:border-red-500': errors.code }"
              @blur="validateField('code')"
            />
            <button
              type="button"
              class="h-10 w-[70px] flex-shrink-0 rounded-md text-sm transition-colors hover:cursor-pointer hover:text-blue-300 dark:text-gray-200"
              @click="() => message.info('验证码以发送至您的邮箱，请注意查收')"
            >
              <span>获取验证码</span>
            </button>
          </div>
          <div v-if="errors.code" class="absolute pl-3 text-[0.9rem] font-light text-red-500">
            {{ errors.code }}
          </div>
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          :disabled="isLoading"
          class="submit-btn relative flex w-full justify-center rounded-md px-6 text-xl text-white hover:cursor-pointer"
        >
          <p
            class="dark:border-borderDark w-full rounded-3xl bg-amber-100 px-10 py-3 text-black transition-colors hover:bg-amber-200 dark:bg-white/70 dark:hover:bg-white"
          >
            {{ submitText }}
          </p>
        </button>

        <!-- 底部链接 -->
        <div class="mt-6 flex text-sm" :class="isLogin ? 'justify-between' : 'justify-end'">
          <button
            v-if="isLogin"
            class="font-medium transition-colors hover:text-blue-500"
            @click="$emit('forgot-password')"
            type="button"
          >
            忘记密码？
          </button>
          <button
            class="font-medium transition-colors hover:text-blue-500 dark:text-white"
            @click="$emit('toggle-mode')"
            type="button"
          >
            {{ isLogin ? '注册新账号' : '已有账号？去登录' }}
          </button>
        </div>

        <!-- 主题切换和装饰图片 -->
        <div class="absolute bottom-0 left-0 hidden translate-x-[-100%] sm:block">
          <img src="/src/assets/images/marisa.png" class="pointer-events-none w-32 select-none" />
          <btnTheme :size="'42'" class="absolute top-0 left-[-4px]" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, Mail } from 'lucide-vue-next'
import { reactive, ref } from 'vue'

import { fetchCaptcha } from '@/api'
import btnTheme from '@/components/ui/ThemeSwitcher.vue'
import { useMessage } from '@/composables/useMessage'
import { throttle } from '@/utils'

interface Props {
  title: string
  submitText: string
  isLogin?: boolean
  isLoading?: boolean
}

interface Emits {
  submit: [formData: { email: string; password: string; code: string }]
  'toggle-mode': []
  'forgot-password': []
}

const props = withDefaults(defineProps<Props>(), {
  isLogin: false,
})

const emit = defineEmits<Emits>()

const message = useMessage()

// 密码显示与隐藏切换
const passwordFieldType = ref<'password' | 'text'>('password')
const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}

// 表单数据
const formValue = reactive({
  email: '',
  password: '',
  code: '',
})

// 错误信息
const errors = reactive({
  email: '',
  password: '',
  code: '',
})

// 验证规则
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
  code: [
    {
      validator: (value: string) => {
        if (!props.isLogin) {
          if (!value) return '请填写验证码'
          return true
        }
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
const validateField = (field: FieldName): boolean => {
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
      const result = rule.validator ? rule.validator(value) : true
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
const validate = (): boolean => {
  let isValid = true
  ;(Object.keys(formValue) as FieldName[]).forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })
  return isValid
}

// 获取验证码逻辑
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
const getCodeThrottle = throttle(btnCreateCode, 2000)

// 表单提交
const handleSubmit = async () => {
  if (!validate()) {
    return
  }
  emit('submit', { ...formValue })
}

// 重置表单
const resetForm = () => {
  formValue.email = ''
  formValue.password = ''
  formValue.code = ''
  generatedCode.value = ''
  Object.keys(errors).forEach((key) => {
    errors[key as FieldName] = ''
  })
}

// 暴露给父组件的方法
defineExpose({
  resetForm,
})
</script>

<style scoped>
.submit-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background-color: #a3b3df;
  border-radius: 9999px;
  transform: scaleY(0);
  transition: transform 0.2s ease;
}
.submit-btn:hover::after {
  transform: scaleY(1);
}
</style>
