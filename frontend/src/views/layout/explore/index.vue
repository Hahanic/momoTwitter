<template>
<main class="sm:w-[38rem] sm:min-h-screen w-[100vw] border-x-1 dark:border-borderDark border-borderWhite">

  <div class="min-h-[3.2rem] w-full z-10 sticky top-0 dark:bg-[#000]/80 dark:backdrop-blur-sm backdrop-blur-lg bg-[#ffffff]/80 border-b-1 dark:border-borderDark border-borderWhite">
    <!-- 搜索及设置 -->
    <div class="w-full flex justify-center items-center h-[3.2rem]">
      <div class="flex w-full items-center relative dark:border-borderDark rounded-2xl ml-5">
        <SearchIcon :size="17.6" class="absolute left-3"/>
        <input type="text" placeholder="搜索" class="w-[95%] h-[2.4rem] rounded-2xl dark:bg-[#181818] bg-[#f5f5f5] dark:text-white text-amber-950 pl-9 pr-4 outline-none focus:ring-1 focus:ring-blue-300">
      </div>
      <SettingsIcon :size="24" class="mr-4" />
    </div>
    <!-- 标签 -->
    <div class="w-full h-[3.2rem] flex">
      <RouterLink v-for="item in tagList" :to="`/explore/${item.path}`" class="h-full w-full flex justify-center items-center hover:dark:bg-[#181818] hover:cursor-pointer text-[#71767b] transition-[background-color] relative">
        <span>{{ item.name }}</span>
        <div class="active-underline w-[60%] absolute border-2 border-[#1d9bf0] rounded-2xl bottom-0 hidden"></div>
      </RouterLink>
    </div>
  </div>
  
  <div class="w-full">
    <RouterView />
  </div>
</main>

<aside class=" md:block lg:w-[25rem] w-[15rem] ml-7 h-screen hidden transition-all sticky top-0">
  <div class="mt-4 dark:border-borderDark border-borderWhite border-t-1"></div>
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
</template>

<script setup lang="ts">
import { NScrollbar } from 'naive-ui';
import { SearchIcon, SettingsIcon } from 'lucide-vue-next';
import { ref } from 'vue';

const tagList = ref([
  { name: '为你推荐', path: 'for_you' },
  { name: '当前趋势', path: 'trending' },
  { name: '新闻', path: 'news' },
  { name: '体育', path: 'sports' },
  { name: '娱乐', path: 'entertainment' }
])
</script>

<style scoped>
.router-link-active {
  font-weight: 600;
  color: white; /* 或者你希望的激活颜色 */
}

/* 让激活链接下的下划线显示出来 */
.router-link-active .active-underline {
  display: block;
}
</style>