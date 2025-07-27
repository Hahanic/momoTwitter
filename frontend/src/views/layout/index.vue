<template>
  <div class="w-full h-full flex justify-center dark:bg-[#000] dark:text-white bg-white text-amber-950">
    <div class="transition-all flex">

      <header class="xl:w-[17rem] xl:items-start w-[5rem] sm:flex flex-col items-center hidden transition-all h-screen sticky top-0">
        <n-scrollbar style="max-height: 100vh;">
          <!-- <menuList /> -->
          <div class="w-full h-[5.2rem] z-10 flex items-center relative">
            <img @click="themeStore.toggleTheme()" class="w-[3.3rem] h-[3.3rem] absolute xl:left-[51px] left-[28px] hover:cursor-pointer" src="/warp.svg" />
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

      <div class="transition-all flex">
        <RouterView />
      </div>

    </div>
    <transition name="fade">
      <ComposeModal v-if="showModal"></ComposeModal>
    </transition>
  </div>

</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref, watch } from 'vue';
import { NScrollbar } from 'naive-ui'
import GooeyNav from "@/components/menuList/index.vue";
import { useRoute } from 'vue-router';
import useThemeStore from '@/stores/theme';

const ComposeModal = defineAsyncComponent(() => 
  import("@/components/ComposeModal/index.vue")
);

const themeStore = useThemeStore()

const route = useRoute()

const showModal = ref(true)

watch(() => route.path, (newPath) => {
  if (newPath === '/compose/post') {
    showModal.value = true
  } else {
    showModal.value = false
  }
}, { immediate: true }
)


import { HomeIcon, Search, Bell, Mail, BotIcon, Rows3, Bookmark, BriefcaseBusiness, Users2, User2, CircleEllipsis, Send } from 'lucide-vue-next'
const menuLists = [
  {
    icon: HomeIcon,
    label: '主页',
    href: '#'
  },
  {
    icon: Search,
    label: '探索',
    href: '#'
  },
  {
    icon: Bell,
    label: '通知',
    href: '#'
  },
  {
    icon: Mail,
    label: '私信',
    href: '#'
  },
  {
    icon: BotIcon,
    label: '智能',
    href: '#'
  },
  {
    icon: Rows3,
    label: '列表',
    href: '#'
  },
  {
    icon: Bookmark,
    label: '书签',
    href: '#'
  },
  {
    icon: BriefcaseBusiness,
    label: '工作',
    href: '#'
  },
  {
    icon: Users2,
    label: '社群',
    href: '#'
  },
  {
    icon: User2,
    label: '个人资料',
    href: '#'
  },
  {
    icon: CircleEllipsis,
    label: '更多',
    href: '#'
  },
  {
    icon: Send,
    label: '发帖',
    href: '/compose/post'
  },
];
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>