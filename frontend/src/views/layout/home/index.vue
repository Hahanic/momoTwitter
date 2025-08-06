<template>
  <main
    class="sm:w-[38rem] sm:min-h-screen w-[100vw] border-x-1 dark:border-borderDark border-borderWhite"
  >
    <div
      class="h-[3.2rem] w-full z-10 sticky top-0 dark:bg-[#000]/80 dark:backdrop-blur-sm backdrop-blur-lg bg-[#ffffff]/80 border-b-1 dark:border-borderDark border-borderWhite grid grid-cols-2"
    >
      <div
        class="flex justify-center items-center dark:hover:bg-[#181818]/90 hover:bg-[#e7e7e8]/70 transition-all cursor-pointer"
      >
        为你推荐
      </div>
      <div
        class="flex justify-center items-center dark:hover:bg-[#181818]/80 hover:bg-[#e7e7e8]/70 transition-all cursor-pointer"
      >
        关注
      </div>
    </div>

    <div class="w-full">
      <!-- user -->
      <userSendCard />
      <!-- posts -->
      <posts />
      <div class="h-20 w-full flex justify-center items-center">
        <LoaderIcon
          v-if="postStore.hasMore && postStore.isLoading"
          :class="{ 'animate-spin': postStore.isLoading }"
          :size="26"
        />
        <span v-else>没有更多了</span>
      </div>
    </div>
  </main>

  <aside
    class="md:block lg:w-[25rem] w-[15rem] ml-7 h-screen hidden transition-all sticky top-0"
  >
    <!-- 搜索框 -->
    <div class="h-[3.2rem] flex items-center z-10">
      <div
        class="flex w-full items-center relative dark:border-borderDark rounded-2xl"
      >
        <SearchIcon :size="17.6" class="absolute left-3" />
        <input
          type="text"
          placeholder="搜索"
          class="w-full h-[2.4rem] rounded-2xl dark:bg-[#181818] bg-[#f5f5f5] dark:text-white text-amber-950 pl-9 pr-4 outline-none focus:ring-1 focus:ring-blue-300"
        />
      </div>
    </div>
    <!-- 推送 -->
    <n-scrollbar :trigger="'hover'" style="max-height: 90vh">
      <div class="w-full flex flex-col gap-[1.2rem] mt-[0.8rem]">
        <div
          class="h-[9rem] rounded-xl dark:border-borderDark border-borderWhite border-1"
        ></div>
        <div
          class="h-[35rem] rounded-xl dark:border-borderDark border-borderWhite border-1"
        ></div>
      </div>
    </n-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import userSendCard from '@/components/userSendCard/index.vue'
import posts from '@/components/post/index.vue'
import { NScrollbar } from 'naive-ui'
import { SearchIcon, LoaderIcon } from 'lucide-vue-next'
import usePostStore from '@/stores/post'

const postStore = usePostStore()
</script>
