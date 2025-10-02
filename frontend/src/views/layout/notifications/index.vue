<template>
  <MainContainer>
    <StickyHead>
      <!-- 标签 -->
      <div class="flex h-[3rem] w-full">
        <button
          v-for="item in tagList"
          class="relative flex h-full w-full items-center justify-center text-[#71767b] transition-[background-color] hover:cursor-pointer hover:dark:bg-[#181818]"
        >
          <span class="text-[0.9rem]">{{ item.name }}</span>
          <div class="absolute bottom-0 hidden w-[60%] rounded-2xl border-2 border-[#1d9bf0]"></div>
        </button>
      </div>
    </StickyHead>

    <div class="w-full"></div>
  </MainContainer>

  <StickyAside>
    <div class="dark:border-borderDark border-borderWhite mt-4 border-t-1"></div>
    <!-- 推送 -->
    <div class="mt-[0.8rem] flex w-full flex-col gap-[1.2rem]">
      <div class="dark:border-borderDark border-borderWhite h-[9rem] rounded-xl border-1"></div>
      <div class="dark:border-borderDark border-borderWhite h-[35rem] rounded-xl border-1"></div>
    </div>
  </StickyAside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'

const tagList = ref([{ name: '赞和收藏' }, { name: '评论' }, { name: '关注' }])
</script>

<style scoped></style>
