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

    <div class="h-[2000px] w-full bg-amber-50"></div>
  </MainContainer>

  <StickyAside>
    <!-- 搜索框 -->
  </StickyAside>
</template>

<script setup lang="ts">
import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
</script>
