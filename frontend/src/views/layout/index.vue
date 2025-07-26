<template>
  <div class="flex justify-center dark:bg-[#000] dark:text-white bg-white text-amber-950">
    <div class="transition-all flex">

      <header class="xl:w-[17rem] xl:items-start w-[5rem] sm:flex flex-col items-center hidden transition-all h-screen sticky top-0">
        <n-scrollbar style="max-height: 100vh;">
          <!-- <menuList /> -->
          <div class="w-full h-[5.2rem] z-10 flex items-center relative">
           <img class="w-[3.3rem] h-[3.3rem] absolute xl:left-[51px] left-[28px] hover:cursor-pointer" src="/warp.svg" />
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
        <main class="sm:w-[38rem] sm:min-h-screen w-[100vw] border-x-1 dark:border-borderDark border-borderWhite">

          <div class="h-[3.2rem] w-full z-10 sticky top-0 dark:bg-[#000]/80 dark:backdrop-blur-sm backdrop-blur-lg bg-[#ffffff]/80 border-b-1 dark:border-borderDark border-borderWhite grid grid-cols-2">
            <div class="flex justify-center items-center dark:hover:bg-[#181818]/90 hover:bg-[#e7e7e8]/70 transition-all cursor-pointer">为你推荐</div>
            <div class="flex justify-center items-center dark:hover:bg-[#181818]/80 hover:bg-[#e7e7e8]/70 transition-all cursor-pointer">关注</div>
          </div>
          
          <div class="w-full">
            <!-- user -->
            <userSendCard />
            <!-- posts -->
            <posts />
          </div>
        </main>

        <aside class=" md:block lg:w-[25rem] w-[15rem] ml-7 h-screen hidden transition-all sticky top-0">
          <!-- 搜索框 -->
          <div class="h-[3.2rem] flex items-center z-10">
            <div class="flex w-full items-center relative dark:border-borderDark border-borderWhite border-1 rounded-2xl">
              <SearchIcon :size="17.6" class="absolute left-3"/>
              <input type="text" placeholder="搜索" class="w-full h-[2.4rem] rounded-2xl dark:bg-[#181818] bg-[#f5f5f5] dark:text-white text-amber-950 pl-9 pr-4 outline-none focus:ring-1 focus:ring-blue-300">
            </div>
          </div>
          <!-- 推送 -->
          <n-scrollbar :trigger="'hover'" style="max-height: 90vh">
            <div class="w-full flex flex-col gap-[1.2rem] mt-[0.8rem]">
              <div class="h-[9rem] rounded-xl dark:border-borderDark border-borderWhite border-1">
              </div>
              <div class="h-[35rem] rounded-xl dark:border-borderDark border-borderWhite border-1">
              </div>
            </div>
          </n-scrollbar>

        </aside>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NScrollbar } from 'naive-ui'
import userSendCard from '@/components/userSendCard/index.vue'
import posts from '@/components/post/index.vue'
import GooeyNav from "@/components/menuList/index.vue";

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
  SearchIcon,
} from 'lucide-vue-next'

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
];

</script>

<style scoped>

</style>