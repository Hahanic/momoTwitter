<template>
  <div class="flex w-full justify-center bg-white text-amber-950 dark:bg-[#000] dark:text-white">
    <div class="flex transition-all" :inert="showModal">
      <!-- 桌面端菜单 -->
      <header
        v-if="!windowStore.isMobile"
        class="sticky top-0 hidden h-screen w-[5rem] flex-col items-center transition-all sm:flex xl:w-[17rem] xl:items-start"
      >
        <div class="relative z-10 flex h-[64px] w-full items-center">
          <img
            @click="themeStore.toggleTheme()"
            class="absolute left-[24px] h-[2.3rem] w-[2.3rem] hover:cursor-pointer xl:left-[59px]"
            src="/warp.svg"
          />
        </div>
        <Scrollbar maxHeight="100%">
          <SideBar :items="menuLists" @action="handleSidebarAction" />
        </Scrollbar>
      </header>
      <!-- 移动端菜单 -->
      <transition name="slide-up">
        <header v-if="windowStore.isMobile && windowStore.showNav" class="fixed right-0 bottom-0 left-0 z-50 w-full">
          <BottomNavigation />
        </header>
      </transition>
      <!-- 主体内容 路由出口 -->
      <div class="flex" :class="{ 'pb-16': windowStore.isMobile }">
        <router-view v-slot="{ Component, route }">
          <!-- 移动端且路由为 PostDetail 时，执行特定动画 -->
          <transition v-if="windowStore.isMobile && route.name === 'PostDetail'" name="slide-right" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
          <!-- 其它情况保留 keep-alive 缓存 -->
          <!-- <keep-alive v-else :include="['Profile']"> -->
          <component v-else :is="Component" />
          <!-- </keep-alive> -->
        </router-view>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <div v-if="!windowStore.isMobile" class="fixed right-4 bottom-4 z-11" :inert="showModal">
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
import {
  HomeIcon,
  Search,
  Bell,
  Mail,
  BotIcon,
  Rows3,
  Bookmark,
  BriefcaseBusiness,
  Users2,
  User2,
  CircleEllipsis,
  Send,
  ArrowUp,
} from 'lucide-vue-next'
import { defineAsyncComponent, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Scrollbar from '@/components/common/Scrollbar.vue'
import BottomNavigation from '@/components/layout/BottomNavigation.vue'
import SideBar from '@/components/layout/SideBar.vue'
import { useWindowStore } from '@/stores'
import useUserStore from '@/stores/userUserStore'
import useThemeStore from '@/stores/useThemeStore'

const windowStore = useWindowStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()

// 模态框
const AppModal = defineAsyncComponent(() => import('@/components/modal/index.vue'))
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
    { icon: HomeIcon, label: '主页', href: '/home' },
    { icon: Search, label: '探索', href: '/explore' },
    { icon: Bell, label: '通知', href: '/notifications' },
    { icon: Mail, label: '私信', href: '/messages' },
    { icon: BotIcon, label: '智能', href: '/bot' },
    { icon: Rows3, label: '列表', href: '/lists' },
    { icon: Bookmark, label: '书签', href: '/bookmarks' },
    { icon: BriefcaseBusiness, label: '工作', href: '/work' },
    { icon: Users2, label: '社群', href: '/groups' },
    { icon: User2, label: '个人资料', href: username ? `/profile/${username}` : '/login' },
    { icon: CircleEllipsis, label: '更多', href: '/more' },
    { icon: Send, label: '发帖', href: null, action: 'compose' },
  ]
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
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

/* PostDetail 组件从右边进入和离开的动画 */
.slide-right-enter-active {
  transition:
    transform 0.3s cubic-bezier(0, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.slide-right-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}
.slide-right-enter-from {
  transform: translateX(30%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(30%);
  opacity: 0;
}
.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
