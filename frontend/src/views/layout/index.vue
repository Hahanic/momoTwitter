<template>
  <div class="flex h-full w-full justify-center bg-white text-amber-950 dark:bg-[#000] dark:text-white">
    <div class="flex transition-all">
      <header
        class="sticky top-0 hidden h-screen w-[5rem] flex-col items-center transition-all sm:flex xl:w-[17rem] xl:items-start"
      >
        <n-scrollbar style="max-height: 100%">
          <!-- <menuList /> -->
          <div class="relative z-10 flex h-[3.2rem] w-full items-center">
            <img
              @click="themeStore.toggleTheme()"
              class="absolute left-[24px] h-[2.3rem] w-[2.3rem] hover:cursor-pointer xl:left-[59px]"
              src="/warp.svg"
            />
          </div>
          <GooeyNav
            :items="menuLists"
            :animation-time="600"
            :particle-count="15"
            :particle-distances="[90, 10]"
            :particle-r="100"
            :time-variance="300"
            :colors="[1, 2, 3, 1, 2, 3, 1, 4]"
            :initial-active-index="0"
          />
        </n-scrollbar>
      </header>

      <div class="flex transition-all">
        <RouterView> </RouterView>
      </div>
    </div>
    <transition name="fade">
      <ComposeModal v-if="showModal"></ComposeModal>
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
import { useRoute } from 'vue-router'

import GooeyNav from '@/components/menuList/index.vue'
import useThemeStore from '@/stores/theme'

const themeStore = useThemeStore()
const route = useRoute()

// 模态框
const ComposeModal = defineAsyncComponent(() => import('@/components/ComposeModal/index.vue'))
const showModal = ref(true)
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/compose/post') {
      showModal.value = true
    } else {
      showModal.value = false
    }
  },
  { immediate: true }
)

// 帖子列表
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
    href: '/compose/post',
  },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
