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

    <div class="flex w-full items-center justify-center">404页面</div>
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
