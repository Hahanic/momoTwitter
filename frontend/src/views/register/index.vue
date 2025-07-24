<template>
  <div class="login-container">
    <n-card
      title="用户注册"
      class="login-card"
      header-style="text-align: center; font-size: 1.5rem;"
      content-style="padding: 10px 20px;"
    >
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-align="left"
        size="large"
      >
        <n-form-item path="email" label="账号">
          <n-input
            v-model:value="formValue.email"
            placeholder="请输入邮箱"
            clearable
          />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="formValue.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
          />
        </n-form-item>

        <n-form-item path="emailCode" class="flex h-10">
          <n-button size="large" style="margin-right: 10px;width: 7rem;font-size: 14px;" @click="getCodethrottle">
            <span>获取验证码</span>
          </n-button>
          <n-input
            v-model:value="formValue.emailCode"
            type="text"
            placeholder="请输入邮箱验证码"
          />
        </n-form-item>
        <n-form-item style="margin-top: 25px;">
          <n-button
            type="primary"
            block
            @click="handleLogin"
          >
            确定
          </n-button>
        </n-form-item>
      </n-form>

      <n-space justify="end" class="login-links">
        <n-button text type="primary" @click="router.push('/login')">
          已经有账号？去登录
        </n-button>
      </n-space>

      <div class="hidden sm:block absolute bottom-0 left-0 translate-x-[-100%]">
        <img src="/src/assets/images/marisa.png" class="w-32 pointer-events-none select-none">
        <btnTheme :size="'42'" class="toggle" />
      </div>
    </n-card>


  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
  type FormRules
} from 'naive-ui'
import { useRouter } from 'vue-router'
import { throttle } from '@/utils/index.ts'
import btnTheme from '@/components/btnTheme/index.vue'
import useUserStore from '@/stores/user'

const userStore = useUserStore()

const router = useRouter()
const loadingBar = useLoadingBar()
// Naive UI 的消息提示 Hook
const message = useMessage()
// 表单实例的引用，用于触发表单验证
const formRef = ref<FormInst | null>(null)
// 表单数据
const formValue = ref({
  email: '',
  password: '',
  emailCode: '',
})
// 表单验证规则
const rules: FormRules = {
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: 'blur'
    },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入有效的邮箱地址',
      trigger: ['blur', 'input'] 
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    },
    {
      min: 4,
      message: '密码至少需要4个字符',
      trigger: ['blur', 'input']
    },
    {
      validator: (_, value) => {
        const allowedCharsRegex = /^[a-zA-Z0-9!@#$%^&*()-_+=\[\]{}|;:,.<>/?]*$/;
        const containsOnlyAllowedChars = allowedCharsRegex.test(value);
        if(!containsOnlyAllowedChars) {
          return new Error('密码包含不允许的字符。只能使用字母、数字和常见的特殊符号。');
        }
        return true
      },
      trigger: ['blur', 'input']
    }
  ],
  emailCode: [
    {
      required: true,
      message: '请填写验证码',
      trigger: 'blur',
    },
  ]
}
// 验证码
// 向后端获取验证码
const btnCreateCode = async function () {
  message.success('我们已发送验证码至您的邮箱')
}
const getCodethrottle = throttle(btnCreateCode, 2000)
// 登录
const handleLogin = (e: MouseEvent) => {
  e.preventDefault() // 阻止表单默认提交行为

  formRef.value?.validate(async (errors) => {
    try {
      if (errors) return
      loadingBar.start()
      await userStore.register(formValue.value)
      loadingBar.finish()
      message.success('注册成功')
    } catch (err: any) {
      message.error(err.message || '发生了一个意料之外的错误')
      loadingBar.error()
    }
  })
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