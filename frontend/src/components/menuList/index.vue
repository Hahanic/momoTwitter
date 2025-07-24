<template>
  <div class="flex flex-col xl:items-start items-center gap-1">
    <div v-for="item in menuLists" @click="router.push(item.path)" class="h-[3.2rem] flex items-center justify-center transition-all dark:hover:bg-[#181818] hover:bg-[#e7e7e8] xl:px-4 xl:rounded-3xl px-3 rounded-full hover:cursor-pointer">
        <component :size="'1.7rem'" :is="item.icon" />
        <p v-if="item.text" class="xl:block hidden ml-5 text-[1.1rem]">{{ item.text }}</p>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import { useRouter } from 'vue-router';
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
  CircleEllipsis
} from 'lucide-vue-next'
import btnTheme from '@/components/btnTheme/index.vue'

const menuLists = [
  {
    icon: btnTheme,
    text: '',
    path: '#'
  },
  {
    icon: HomeIcon,
    text: '主页',
    path: '/'
  },
  {
    icon: Search,
    text: '探索',
    path: '/explore'
  },
  {
    icon: Bell,
    text: '通知',
    path: '/notifications'
  },
  {
    icon: Mail,
    text: '私信',
    path: '/messages'
  },
  {
    icon: BotIcon,
    text: '智能',
    path: '/login'
  },
  {
    icon: Rows3,
    text: '列表',
    path: '/lists'
  },
  {
    icon: Bookmark,
    text: '书签',
    path: '/bookmarks'
  },
  {
    icon: BriefcaseBusiness,
    text: '工作',
    path: '/jobs'
  },
  {
    icon: Users2,
    text: '社群',
    path: '/communities'
  },
  {
    icon: User2,
    text: '个人资料',
    path: '/profile'
  },
  {
    icon: CircleEllipsis,
    text: '更多',
    path: '/more'
  }
];

const router = useRouter()

</script>

<style scoped>

</style>