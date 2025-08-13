<template>
  <main class="dark:border-borderDark border-borderWhite w-[100vw] border-x-1 sm:min-h-screen sm:w-[38rem]">
    <div
      class="dark:border-borderDark border-borderWhite sticky top-0 z-10 min-h-[3.2rem] w-full border-b-1 bg-[#ffffff]/80 backdrop-blur-lg dark:bg-[#000]/80 dark:backdrop-blur-sm"
    >
      <!-- 搜索及设置 -->
      <div class="flex h-[3.2rem] w-full items-center justify-center">
        <div class="dark:border-borderDark relative ml-5 flex w-full items-center rounded-2xl">
          <SearchIcon :size="17.6" class="absolute left-3" />
          <input
            type="text"
            placeholder="搜索"
            class="h-[2.4rem] w-[95%] rounded-2xl bg-[#f5f5f5] pr-4 pl-9 text-amber-950 outline-none focus:ring-1 focus:ring-blue-300 dark:bg-[#181818] dark:text-white"
          />
        </div>
        <SettingsIcon :size="24" class="mr-4" />
      </div>
      <!-- 标签 -->
      <div class="flex h-[3.2rem] w-full">
        <RouterLink
          v-for="item in tagList"
          :to="`/explore/${item.path}`"
          class="relative flex h-full w-full items-center justify-center text-[#71767b] transition-[background-color] hover:cursor-pointer hover:dark:bg-[#181818]"
        >
          <span>{{ item.name }}</span>
          <div class="active-underline absolute bottom-0 hidden w-[60%] rounded-2xl border-2 border-[#1d9bf0]"></div>
        </RouterLink>
      </div>
    </div>

    <div class="w-full">
      <RouterView />
    </div>
  </main>

  <aside class="sticky top-0 ml-7 hidden h-screen w-[15rem] transition-all md:block lg:w-[25rem]">
    <div class="dark:border-borderDark border-borderWhite mt-4 border-t-1"></div>
    <!-- 推送 -->
    <n-scrollbar :trigger="'hover'" style="max-height: 90vh">
      <div class="mt-[0.8rem] flex w-full flex-col gap-[1.2rem]">
        <div class="dark:border-borderDark border-borderWhite h-[9rem] rounded-xl border-1"></div>
        <div class="dark:border-borderDark border-borderWhite h-[35rem] rounded-xl border-1"></div>
      </div>
    </n-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { SearchIcon, SettingsIcon } from 'lucide-vue-next'
import { NScrollbar } from 'naive-ui'
import { ref } from 'vue'

const tagList = ref([
  { name: '为你推荐', path: 'for_you' },
  { name: '当前趋势', path: 'trending' },
  { name: '新闻', path: 'news' },
  { name: '体育', path: 'sports' },
  { name: '娱乐', path: 'entertainment' },
])
</script>

<style scoped>
.router-link-active {
  font-weight: 600;
  color: black;
}
.dark .router-link-active {
  color: white;
}
/* 让激活链接下的下划线显示出来 */
.router-link-active .active-underline {
  display: block;
}
</style>
