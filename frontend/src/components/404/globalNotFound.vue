<template>
  <MainContainer>
    <StickyHead>
      <div class="flex w-full">
        <div
          class="flex h-[3.2rem] w-[50%] cursor-pointer items-center justify-center transition-all hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/90"
        >
          为你推荐
        </div>
        <div
          class="flex h-[3.2rem] w-[50%] cursor-pointer items-center justify-center transition-all hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/80"
        >
          关注
        </div>
      </div>
    </StickyHead>

    <div class="flex w-full items-center justify-center">
      <div class="py-20 text-center">
        <h1 class="mb-4 text-6xl font-bold text-gray-400">404</h1>
        <p class="text-xl text-gray-600">页面未找到</p>
        <p class="mt-2 text-gray-500">抱歉，您访问的页面不存在。</p>
      </div>
    </div>
  </MainContainer>

  <StickyAside>
    <div class="flex h-full w-full items-center justify-center">404</div>
  </StickyAside>
</template>

<script setup lang="ts">
import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
</script>

<style scoped></style>
