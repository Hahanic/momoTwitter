<template>
  <div class="login-container">
    <n-card
      title="用户登录"
      class="login-card"
      header-style="text-align: center; font-size: 1.5rem;"
      content-style="padding: 10px 20px;"
    >
      <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-align="left" size="large">
        <n-form-item path="email" label="账号">
          <n-input v-model:value="formValue.email" placeholder="请输入邮箱" clearable />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="formValue.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
          />
        </n-form-item>

        <n-form-item path="userInputCode" class="flex h-10">
          <n-button size="large" style="margin-right: 10px; width: 7rem; font-size: 14px" @click="getCodethrottle">
            <span>{{ generatedCode || '获取验证码' }}</span>
          </n-button>
          <n-input v-model:value="formValue.userInputCode" type="text" placeholder="请输入验证码" />
        </n-form-item>
        <n-form-item style="margin-top: 25px">
          <n-button type="primary" block @click="handleLogin"> 登录 </n-button>
        </n-form-item>
      </n-form>

      <n-space justify="space-between" class="login-links">
        <n-button text type="primary" @click="handleForgotPassword"> 忘记密码？ </n-button>
        <n-button text type="primary" @click="router.push('/register')"> 注册新账号 </n-button>
      </n-space>

      <div class="absolute bottom-0 left-0 hidden translate-x-[-100%] sm:block">
        <img src="/src/assets/images/marisa.png" class="pointer-events-none w-32 select-none" />
        <btnTheme :size="'42'" class="toggle" />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  NForm,
  NFormItem,
  NCard,
  NInput,
  NButton,
  NSpace,
  useMessage,
  useLoadingBar,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { getIdentifyingCode } from '@/api/index.ts'
import useUserStore from '@/stores/user'
import { throttle } from '@/utils/index.ts'
import btnTheme from '@/components/btnTheme/index.vue'

const userStore = useUserStore()

const router = useRouter()
const route = useRoute()

const loadingBar = useLoadingBar()
// Naive UI 的消息提示 Hook
const message = useMessage()

onMounted(() => {
  if (route.query.redirectReason === 'unauthenticated') {
    message.error('未登录或状态过期，请重新登录')
  }
})

// 表单实例的引用，用于触发表单验证
const formRef = ref<FormInst | null>(null)
// 表单数据
const formValue = ref({
  email: '',
  password: '',
  userInputCode: '',
})
// 表单验证规则
const rules: FormRules = {
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: 'blur',
    },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入有效的邮箱地址',
      trigger: ['blur', 'input'],
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
    {
      min: 4,
      message: '密码至少需要4个字符',
      trigger: ['blur', 'input'],
    },
    {
      validator: (_, value) => {
        const allowedCharsRegex = /^[a-zA-Z0-9!@#$%^&*()-_+=\[\]{}|;:,.<>/?]*$/
        const containsOnlyAllowedChars = allowedCharsRegex.test(value)
        if (!containsOnlyAllowedChars) {
          return new Error('密码包含不允许的字符。只能使用字母、数字和常见的特殊符号。')
        }
        return true
      },
      trigger: ['blur', 'input'],
    },
  ],
  userInputCode: [
    {
      required: true,
      message: '',
      trigger: 'blur',
    },
    {
      validator: (_, value) => {
        if (!generatedCode.value) return new Error('请先获取验证码')
        if (!value) return new Error('请填写验证码')
        if (value.toLowerCase() === generatedCode.value.toLowerCase()) {
          return true
        }
        return new Error('验证码不正确')
      },
      trigger: 'blur',
    },
  ],
}
// 验证码
const generatedCode = ref<string>('')
// 向后端获取验证码
const btnCreateCode = async function () {
  try {
    loadingBar.start()
    const res = await getIdentifyingCode()
    generatedCode.value = res.code
  } catch (err) {
    generatedCode.value = ''
  } finally {
    loadingBar.finish()
  }
}
const getCodethrottle = throttle(btnCreateCode, 2000)
// 登录
const handleLogin = (e: MouseEvent) => {
  e.preventDefault() // 阻止表单默认提交行为
  console.log(12)
  formRef.value?.validate(async (errors) => {
    if (errors) return
    try {
      loadingBar.start()
      await userStore.login(formValue.value)
      loadingBar.finish()
      message.success('登录成功')
      router.push('/')
      generatedCode.value = ''
    } catch (err: any) {
      message.error(err.message || '发生了一个意料之外的错误')
      loadingBar.error()
    }
  })
}
// 忘记密码
const handleForgotPassword = () => {
  // router.push('/forgot-password')
}
</script>
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
}

.login-card {
  width: 400px;
  max-width: 90%; /* 适应小屏幕 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.login-links {
  margin-top: 10px;
}

.toggle {
  position: absolute;
  top: 0;
  left: -4px;
}
</style>
