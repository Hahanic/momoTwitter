<template>
  <div class="flex justify-center dark:bg-[#000] dark:text-white bg-white text-amber-950">
    <div class="transition-all flex">
      <header class="xl:w-[17rem] xl:items-start w-[5rem] sm:flex flex-col items-center hidden transition-all h-screen sticky top-0">
        <!-- <div class="h-[3.2rem] flex items-center px-2 xl:ml-1 rounded-full transition-all dark:hover:bg-[#181818] hover:bg-[#e7e7e8]">
          <btnTheme :size="'2rem'" />
        </div> -->
        <n-scrollbar style="max-height: 100vh;">
          <menuList />
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

        <aside class=" md:block lg:w-[25rem] w-[15rem] pl-3 h-screen hidden transition-all sticky top-0">
          <div class="h-[3.2rem] z-10 flex items-center">
            搜索
          </div>
          <n-scrollbar style="max-height: 80vh">
            <div class="w-full">
              <p>begin</p>
              <h1 v-for="i in 34">Limbus</h1> 
              <p>end</p>
            </div>
          </n-scrollbar>

        </aside>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NScrollbar } from 'naive-ui'
import btnTheme from '@/components/btnTheme/index.vue'
import userSendCard from '@/components/userSendCard/index.vue'
import posts from '@/components/post/index.vue'
import menuList from '@/components/menuList/index.vue'

</script>

<style scoped>
</style>