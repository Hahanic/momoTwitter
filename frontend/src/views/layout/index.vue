<template>
  <div class="flex w-full justify-center bg-white text-amber-950 dark:bg-[#000] dark:text-white">
    <div class="flex transition-all">
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
        <n-scrollbar style="max-height: 100%">
          <SideBar :items="menuLists" @action="handleSidebarAction" />
        </n-scrollbar>
      </header>
      <!-- 移动端菜单 -->
      <transition name="slide-up">
        <header v-if="windowStore.isMobile && windowStore.showNav" class="fixed right-0 bottom-0 left-0 z-50 w-full">
          <BottomNavigation />
        </header>
      </transition>

      <div class="flex" :class="{ 'pb-16': windowStore.isMobile }">
        <router-view v-slot="{ Component, route }">
          <keep-alive include="Home">
            <component :is="Component" :key="route.name" />
          </keep-alive>
        </router-view>
      </div>
    </div>
    <transition name="fade-modal">
      <ComposeModal v-if="showModal" @close="closeModal"></ComposeModal>
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
} from 'lucide-vue-next'
import { NScrollbar } from 'naive-ui'
import { defineAsyncComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BottomNavigation from '@/components/layout/BottomNavigation.vue'
import SideBar from '@/components/layout/SideBar.vue'
import { useWindowStore } from '@/stores'
import useThemeStore from '@/stores/theme'

const windowStore = useWindowStore()
const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()

// 模态框
const ComposeModal = defineAsyncComponent(() => import('@/components/composeModal/index.vue'))
const showModal = ref(false)

watch(
  () => ({ query: route.query }),
  ({ query }) => {
    // 通过查询参数 ?modal=compose 来控制模态框显示
    if (query.modal === 'compose') {
      showModal.value = true
    } else {
      showModal.value = false
    }
  },
  { immediate: true, deep: true }
)

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  // 如果是通过查询参数显示的模态框，移除查询参数
  if (route.query.modal === 'compose') {
    const query = { ...route.query }
    delete query.modal
    router.replace({ path: route.path, query })
  }
}

// 处理侧边栏动作
const handleSidebarAction = (actionType: string) => {
  if (actionType === 'compose') {
    // 通过查询参数打开模态框
    router.push({ path: route.path, query: { ...route.query, modal: 'compose' } })
  }
}

// SideBar列表
const menuLists = [
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
    icon: BotIcon,
    label: '智能',
    href: '/bot',
  },
  {
    icon: Rows3,
    label: '列表',
    href: '/lists',
  },
  {
    icon: Bookmark,
    label: '书签',
    href: '/bookmarks',
  },
  {
    icon: BriefcaseBusiness,
    label: '工作',
    href: '/work',
  },
  {
    icon: Users2,
    label: '社群',
    href: '/groups',
  },
  {
    icon: User2,
    label: '个人资料',
    href: '/profile',
  },
  {
    icon: CircleEllipsis,
    label: '更多',
    href: '/more',
  },
  {
    icon: Send,
    label: '发帖',
    href: null, // 使用 null 表示这是一个特殊处理的按钮
    action: 'compose',
  },
]
</script>

<style>
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
.fade-modal-enter-to,
.fade-modal-leave-from {
  opacity: 1;
}

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
