<template>
  <nav class="border-t border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-[#000]">
    <div class="flex h-full items-center justify-around">
      <RouterLink
        v-for="item in mobileMenuItems"
        :key="item.href"
        :to="item.href"
        class="flex flex-col items-center justify-center px-3 py-2 text-gray-600 transition-colors hover:text-amber-950 dark:text-gray-400 dark:hover:text-white"
        active-class="text-amber-950 dark:text-white"
      >
        <component :is="item.icon" :size="24" />
        <span class="mt-1 text-xs">{{ item.label }}</span>
      </RouterLink>
      <!-- <button
        @click="handleCompose"
        class="flex flex-col items-center justify-center px-3 py-2 text-gray-600 transition-colors hover:text-amber-950 dark:text-gray-400 dark:hover:text-white"
      >
        <component :is="Send" :size="24" />
        <span class="mt-1 text-xs">发帖</span>
      </button> -->
    </div>
  </nav>
</template>

<script setup lang="ts">
import { HomeIcon, Search, Bell, Mail, User2, CircleEllipsis } from 'lucide-vue-next'

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
    icon: Bell,
    label: '通知',
    href: '/notifications',
  },
  {
    icon: Mail,
    label: '私信',
    href: '/messages',
  },
  {
    icon: User2,
    label: '我的',
    href: '/profile',
  },
  {
    icon: CircleEllipsis,
    label: '设置',
    href: '/more',
  },
]
</script>
