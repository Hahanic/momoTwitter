<template>
  <div class="modal-mobile-menu flex h-full w-full sm:hidden">
    <div class="h-full w-[80%] flex-1 bg-white py-6 shadow-2xl dark:bg-black">
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
          <div class="relative">
            <button
              @click="toggleAccountMenu"
              class="mr-2 flex h-full items-center justify-center rounded-full p-2 text-black transition-[background-color] hover:cursor-pointer dark:text-white"
            >
              <MoreHorizontalIcon :size="20" />
            </button>

            <!-- 账户菜单 -->
            <div
              v-if="showMobileAccountMenu"
              ref="accountMenuRef"
              class="absolute top-10 right-0 w-[10rem] rounded-2xl border-1 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black"
            >
              <div class="flex w-full flex-col">
                <button
                  v-if="userStore.isAuthenticated"
                  @click="userStore.logout()"
                  class="rounded-2xl p-3 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
                >
                  <span>{{ t('sidebar.authActions.logout', { username: userStore.user?.username }) }}</span>
                </button>
                <div v-else class="w-full">
                  <button
                    @click="router.push({ path: route.path, query: { ...route.query, modal: 'login' } })"
                    class="w-full rounded-t-2xl p-3 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
                  >
                    <span>{{ t('sidebar.authActions.loginExistingAccount') }}</span>
                  </button>
                  <button
                    @click="router.push({ path: route.path, query: { ...route.query, modal: 'register' } })"
                    class="w-full rounded-b-2xl p-3 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
                  >
                    <span>{{ t('sidebar.authActions.registerNewAccount') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- username和displayName -->
        <div class="mt-4 flex flex-col pl-6">
          <div class="text-lg font-bold">{{ userStore.user?.displayName }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ userStore.isAuthenticated ? `@${userStore.user?.username}` : '未登录' }}
          </div>
        </div>
        <!-- 分割线 -->
        <div class="my-4 border-t border-gray-200 dark:border-gray-700" />
        <!-- 菜单选项 -->
        <Scrollbar maxHeight="calc(100vh - 200px)" visibility="hidden" propsClass="flex-1">
          <div class="flex flex-col">
            <div
              @click="handleProfileClick"
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
              @click="handleBookmarksClick"
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
            <div
              @click="router.push('/bot')"
              class="flex cursor-pointer gap-2 py-3 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <BotIcon :size="24" />
              <span>人工智能</span>
            </div>
            <div
              v-if="userStore.isAuthenticated"
              @click="userStore.logout"
              class="flex cursor-pointer gap-2 py-3 pl-6 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut :size="24" />
              <span>退出登录</span>
            </div>
            <div
              v-else
              @click="router.push({ path: route.path, query: { ...route.query, modal: 'login' } })"
              class="flex cursor-pointer gap-2 py-3 pl-6 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut :size="24" />
              <span>登录</span>
            </div>
          </div>
        </Scrollbar>
      </div>
    </div>
    <div class="w-[20%]" @click="$emit('close')"></div>
  </div>
</template>
<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { BotIcon, User2, Settings, MoreHorizontalIcon, LogOut, List, Save, MessageCircleMore } from 'lucide-vue-next'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

import Scrollbar from '../common/Scrollbar.vue'
import Avatar from '../ui/Avatar.vue'

import { useUserStore } from '@/stores'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const showMobileAccountMenu = ref(false)
const accountMenuRef = ref<HTMLElement | null>(null)

// 控制账户菜单显示
const toggleAccountMenu = (event: Event) => {
  event.stopImmediatePropagation()
  showMobileAccountMenu.value = !showMobileAccountMenu.value
}

// 没登陆就弹出登录框
const handleProfileClick = () => {
  if (userStore.isAuthenticated) {
    router.push(`/profile/${userStore.user?.username}`)
  } else {
    router.push({ path: route.path, query: { ...route.query, modal: 'login' } })
  }
}

const handleBookmarksClick = () => {
  if (userStore.isAuthenticated) {
    router.push(`/profile/${userStore.user?.username}/bookmarks`)
  } else {
    router.push({ path: route.path, query: { ...route.query, modal: 'login' } })
  }
}

onClickOutside(accountMenuRef, toggleAccountMenu)
</script>
