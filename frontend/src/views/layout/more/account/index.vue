<template>
  <div class="flex h-[3.2rem] w-full justify-start" :class="{ 'fixed top-0': windowStore.isMobile }">
    <div class="flex items-center justify-center">
      <button
        @click="router.push('/more')"
        class="rounded-full p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft :size="24" />
      </button>
      <div class="ml-5 text-xl font-bold">
        <p>账号信息</p>
      </div>
    </div>
  </div>

  <div class="flex w-full flex-col pt-[3.2rem] sm:pt-0">
    <ul>
      <li v-for="item in listItems" class="w-full transition-all hover:bg-[#f7f9f9] dark:hover:bg-[#16181c]">
        <RouterLink :to="item.href" class="flex w-full items-center justify-between px-4 py-3">
          <div class="flex flex-col">
            <span class="text-1 leading-1.1">{{ item.label }}</span>
            <span class="text-[0.9rem] leading-none text-[#71767b]">{{ item.value }}</span>
          </div>
          <svg class="w-6 text-[#71767b]" viewBox="0 0 24 24" aria-hidden="true">
            <g>
              <path
                fill="currentColor"
                d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"
              ></path>
            </g>
          </svg>
        </RouterLink>
      </li>
    </ul>
    <div class="h-200"></div>
  </div>

  <!-- <div class="dark:border-borderDark border-borderWhite mt-3 w-full border-t-1 pt-3">
    <div v-if="userStore.isAuthenticated">
      <div class="flex h-[6rem] items-center">
        <img :src="userStore.user?.avatarUrl || '/cat.svg'" class="h-full w-[6rem] rounded-full object-cover" />
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
  </div> -->
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import { useMessage } from '@/composables/useMessage'
import { useWindowStore } from '@/stores'
import useUserStore from '@/stores/userUserStore'

const router = useRouter()
const message = useMessage()
const windowStore = useWindowStore()
const userStore = useUserStore()

const logoutAndclear = async () => {
  try {
    await userStore.logout()
    message.success('已退出登录')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
  }
}

const listItems = [
  { label: '用户名', value: '@JASttenet', href: '#' },
  { label: '显示名称', value: 'JASttenet', href: '#' },
  { label: '手机号', value: '+1234567890', href: '#' },
  { label: '邮箱', value: 'example@example.com', href: '#' },
  { label: '账号创建时间', value: '2020-01-01', href: '#' },
  { label: '国家/地区', value: '中国', href: '#' },
  { label: '语言', value: '中文 (简体)', href: '#' },
  { label: '性别', value: '男', href: '#' },
  { label: '生日', value: '2000-06-01', href: '#' },
  { label: '年龄', value: '27', href: '#' },
  { label: '戏仿、评论和粉丝账号', value: '管理你的戏仿、评论和粉丝账号', href: '#' },
  { label: '更改你的密码', value: '随时更改你的密码', href: '#' },
  { label: '停用你的账号', value: '了解如何停用账号', href: '#' },
]
</script>

<style scoped></style>
