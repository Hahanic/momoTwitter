<template>
  <div class="h-full w-[90%] bg-white py-6 dark:bg-black">
    <div class="h-full w-full">
      <!-- 头像和账号菜单 -->
      <div class="flex w-full items-center justify-between pl-6">
        <div class="h-14 w-14">
          <Avatar
            :src="userStore.user?.avatarUrl || '/cat.svg'"
            :username="userStore.user?.username"
            :alt="userStore.user?.displayName"
            :containerClass="'h-14 w-14 '"
          />
        </div>
        <button
          class="mr-2 flex h-full items-center justify-center rounded-full p-2 text-black transition-[background-color] hover:cursor-pointer dark:text-white"
        >
          <MoreHorizontalIcon :size="20" />
        </button>
      </div>
      <!-- username和displayName -->
      <div class="mt-4 flex flex-col pl-6">
        <div class="text-lg font-bold">{{ userStore.user?.displayName }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">@{{ userStore.user?.username }}</div>
      </div>
      <!-- 分割线 -->
      <div class="my-4 border-t border-gray-200 dark:border-gray-700" />
      <!-- 菜单选项 -->
      <div class="flex flex-col">
        <div
          @click="router.push(`/profile/${userStore.user?.username}`)"
          class="flex cursor-pointer gap-2 py-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <User2 :size="24" />
          <span>个人资料</span>
        </div>
        <div class="flex cursor-pointer gap-2 py-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800">
          <MessageCircleMore :size="24" />
          <span>话题</span>
        </div>
        <div
          @click="router.push(`/profile/${userStore.user?.username}/bookmarks`)"
          class="flex cursor-pointer gap-2 py-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Save :size="24" />
          <span>收藏</span>
        </div>
        <div class="flex cursor-pointer gap-2 py-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800">
          <List :size="24" />
          <span>列表</span>
        </div>
        <div
          @click="router.push('/more')"
          class="flex cursor-pointer gap-2 py-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Settings :size="24" />
          <span>设置</span>
        </div>
        <div class="flex cursor-pointer gap-2 py-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800">
          <BotIcon :size="24" />
          <span>人工智能</span>
        </div>
        <div
          @click="userStore.logout"
          class="flex cursor-pointer gap-2 py-3 pl-6 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LogOut :size="24" />
          <span>退出登录</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { BotIcon, User2, Settings, MoreHorizontalIcon, LogOut, List, Save, MessageCircleMore } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import Avatar from '../post/Avatar.vue'

import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
</script>
