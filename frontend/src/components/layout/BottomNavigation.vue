<template>
  <nav class="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-[#000]">
    <div class="relative flex h-full items-center justify-around">
      <RouterLink
        v-for="item in mobileMenuItems"
        :key="item.href"
        :to="item.href"
        class="flex flex-col items-center justify-center px-3 py-4 text-gray-600 transition-colors hover:text-amber-950 dark:text-gray-400 dark:hover:text-white"
        active-class="text-amber-950 dark:text-white"
      >
        <component :is="item.icon" :size="24" />
        <!-- <span class="mt-1 text-xs">{{ item.label }}</span> -->
      </RouterLink>
      <button
        @click="router.push({ path: route.path, query: { ...route.query, modal: 'compose' } })"
        class="floating-send-button absolute right-4 bottom-[5rem] flex h-[3.6rem] w-[3.6rem] cursor-pointer items-center justify-center rounded-full bg-blue-400 text-white shadow-lg hover:bg-blue-500"
      >
        <component :is="Send" :size="24" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { HomeIcon, Search, Bell, Mail, Users2, Send } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 移动端显示的主要菜单项
const mobileMenuItems = [
  {
    icon: HomeIcon,
    label: '主页',
    href: '/home',
  },
  {
    icon: Search,
    label: '探索',
    href: '/explore',
  },
  {
    icon: Users2,
    label: '群组',
    href: '/groups',
  },
  {
    icon: Bell,
    label: '通知',
    href: '/notifications',
  },
  {
    icon: Mail,
    label: '私信',
    href: '/messages',
  },
]
</script>

<style scoped></style>
