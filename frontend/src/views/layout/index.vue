<template>
  <div class="flex w-full justify-center bg-white text-amber-950 dark:bg-[#000] dark:text-white">
    <div class="flex transition-all" :inert="showModal" :class="{ 'w-full': windowStore.isMobile }">
      <!-- 桌面端菜单 -->
      <header
        v-if="!windowStore.isMobile"
        class="sticky top-0 hidden h-[100dvh] w-[5rem] flex-col items-center sm:flex xl:w-[17rem] xl:items-start"
      >
        <!-- 应用图标 -->
        <div class="relative z-10 flex h-[64px] w-full items-center">
          <img class="absolute left-[16px] h-[2.3rem] w-[2.3rem] hover:cursor-pointer xl:left-[12px]" src="/warp.svg" />
        </div>
        <!-- 菜单栏 -->
        <Scrollbar maxHeight="100%">
          <SideBar :items="menuLists" @action="handleSidebarAction" />
        </Scrollbar>
        <!-- 用户卡片 -->
        <div class="relative mb-1 h-20 w-full">
          <!-- 头像和name -->
          <div
            @click.stop="toggleAccountMenu"
            class="flex h-full w-full items-center justify-center gap-2 rounded-full px-3 transition-[background-color] hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-[#181818]"
          >
            <!-- 头像 -->
            <div
              class="group relative flex h-12 w-12 items-center justify-center rounded-full transition-all hover:cursor-pointer"
            >
              <img
                :src="userStore.user?.avatarUrl || '/cat.svg'"
                :alt="userStore.user?.displayName"
                class="h-full w-full rounded-full object-cover transition-transform duration-300 ease-in-out select-none group-hover:scale-110 group-hover:-rotate-8"
              />
            </div>
            <div class="hidden w-full flex-1 text-[0.9rem] xl:block">
              <AuthorAndSettings
                :userDisplayName="userStore.user?.displayName ?? t('sidebar.authActions.notLoggedIn')"
                :username="`${userStore.user?.username ?? t('sidebar.authActions.notLoggedIn')}`"
                type="card"
                :iconSize="20"
                :iconColor="'white'"
              />
            </div>
          </div>
          <!-- 账户菜单 -->
          <div
            v-if="showAccountMenu"
            ref="accountMenuRef"
            class="absolute bottom-20 left-4 w-[10rem] rounded-md border-1 border-gray-200 bg-white shadow-lg xl:left-4 xl:w-[16rem] dark:border-gray-700 dark:bg-black"
          >
            <div class="flex w-full flex-col">
              <button
                v-if="userStore.isAuthenticated"
                @click="userStore.logout()"
                class="rounded-md p-3 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
              >
                <span>{{ t('sidebar.authActions.logout', { username: userStore.user?.username }) }}</span>
              </button>
              <div v-else class="w-full">
                <button
                  @click="router.push({ path: '/login' })"
                  class="w-full rounded-md p-3 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
                >
                  <span>{{ t('sidebar.authActions.loginExistingAccount') }}</span>
                </button>
                <button
                  @click="router.push({ path: '/register' })"
                  class="w-full rounded-md p-3 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
                >
                  <span>{{ t('sidebar.authActions.registerNewAccount') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <!-- 主体内容 路由出口 -->
      <div class="flex w-full" :class="{ 'pb-16': windowStore.isMobile }" :inert="showAccountMenu">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
      <!-- 移动端菜单 -->
      <transition name="slide-up">
        <footer v-if="windowStore.isMobile && windowStore.showNav" class="fixed right-0 bottom-0 left-0 z-50 w-full">
          <BottomNavigation />
        </footer>
      </transition>
    </div>

    <!-- 返回顶部按钮 -->
    <div v-if="!windowStore.isMobile" class="fixed right-4 bottom-4 z-11">
      <button
        @click="scrollToTop"
        class="rounded-full bg-[#d4237a] p-2 text-white shadow-md transition-colors hover:cursor-pointer hover:bg-[#bf0e63]"
      >
        <ArrowUp />
      </button>
    </div>

    <!-- 模态框 -->
    <transition name="modal-fade" mode="out-in">
      <AppModal v-if="showModal && currentModalType" :modalType="currentModalType" @close="closeModal"></AppModal>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { HomeIcon, Search, Bell, Mail, BotIcon, Users2, User2, Send, ArrowUp, CircleEllipsis } from 'lucide-vue-next'
import { defineAsyncComponent, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import Scrollbar from '@/components/common/Scrollbar.vue'
import BottomNavigation from '@/components/layout/BottomNavigation.vue'
import SideBar from '@/components/layout/SideBar.vue'
import AuthorAndSettings from '@/components/post/AuthorAndSettings.vue'
import { useWindowStore } from '@/stores'
import useUserStore from '@/stores/userUserStore'

const windowStore = useWindowStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const showAccountMenu = ref(false)
const accountMenuRef = ref<HTMLElement | null>(null)

const AppModal = defineAsyncComponent(() => import('@/components/modal/BaseModal.vue'))
const showModal = ref(false)
const currentModalType = ref<string | null>(null)

// 监听整个路由查询参数的变化
watch(
  () => route.query.modal,
  (modalValue) => {
    if (typeof modalValue === 'string' && modalValue) {
      currentModalType.value = modalValue
      showModal.value = true
    } else {
      showModal.value = false
      currentModalType.value = null
    }
  },
  { immediate: true }
)
// 监听模态框状态，控制滚动条显示与否
watch(
  showModal,
  (isModalOpen) => {
    if (isModalOpen) {
      // 计算并设置滚动条宽度
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
      document.documentElement.classList.add('modal-open')
    } else {
      // 等待模态框动画完成再恢复滚动条防止抖动（0.3s）
      setTimeout(() => {
        document.documentElement.classList.remove('modal-open')
        document.documentElement.style.removeProperty('--scrollbar-width')
      }, 300)
    }
  },
  { immediate: true }
)
// 关闭模态框
const closeModal = () => {
  const query = { ...route.query }
  delete query.modal
  router.replace({ path: route.path, query })
}

// 处理侧边栏动作
const handleSidebarAction = (actionType: string) => {
  if (actionType === 'compose') {
    // 通过查询参数打开模态框
    router.push({ path: route.path, query: { ...route.query, modal: 'compose' } })
  }
}

// SideBar列表
// 动态生成菜单（个人资料需要带上本地用户名）
const menuLists = computed(() => {
  const username = userStore.user?.username
  return [
    { icon: HomeIcon, label: t('sidebar.home'), href: '/home' },
    { icon: Search, label: t('sidebar.explore'), href: '/explore' },
    { icon: Bell, label: t('sidebar.notifications'), href: '/notifications' },
    { icon: Mail, label: t('sidebar.messages'), href: '/messages' },
    { icon: BotIcon, label: t('sidebar.bot'), href: '/bot' },
    { icon: Users2, label: t('sidebar.groups'), href: '/groups' },
    { icon: User2, label: t('sidebar.profile'), href: username ? `/profile/${username}` : '/' },
    { icon: CircleEllipsis, label: t('sidebar.more'), href: '/more' },
    { icon: Send, label: t('sidebar.post'), href: null, action: 'compose' },
  ]
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 控制账户菜单显示
const toggleAccountMenu = (event: Event) => {
  event.stopImmediatePropagation()
  showAccountMenu.value = !showAccountMenu.value
}

onClickOutside(accountMenuRef, toggleAccountMenu)
</script>

<style>
/* 模态框整体淡入淡出动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

/* 移动端底部导航动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
}
/* 浮动按钮组件从右边进入和离开的动画 */
.floating-send-button {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.slide-up-enter-from .floating-send-button {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
.slide-up-enter-active .floating-send-button {
  transition-delay: 0.15s;
}
.slide-up-leave-to .floating-send-button {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
.slide-up-leave-active .floating-send-button {
  transition-delay: 0s;
}
</style>
