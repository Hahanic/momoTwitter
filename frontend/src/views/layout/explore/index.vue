<template>
  <MainContainer>
    <StickyHead>
      <!-- 搜索及设置 -->
      <div class="ml-5 flex w-[95%] items-center justify-center">
        <SearchInput />
        <div class="relative">
          <SettingsIcon :size="20" class="mx-4" />
        </div>
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
    </StickyHead>

    <div class="w-full">
      <RouterView />
    </div>
  </MainContainer>

  <StickyAside>
    <div class="dark:border-borderDark border-borderWhite mt-4 border-t-1"></div>
    <!-- 推送 -->
    <n-scrollbar class="hide-scrollbar" style="height: calc(100dvh - 40px)">
      <div class="mt-[0.8rem] flex w-full flex-col gap-[1.2rem]">
        <div class="dark:border-borderDark border-borderWhite h-[9rem] rounded-xl border-1"></div>
        <div class="dark:border-borderDark border-borderWhite h-[35rem] rounded-xl border-1"></div>
      </div>
    </n-scrollbar>
  </StickyAside>
</template>

<script setup lang="ts">
import { SettingsIcon } from 'lucide-vue-next'
import { NScrollbar } from 'naive-ui'
import { ref } from 'vue'

import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
import SearchInput from '@/components/ui/SearchInput.vue'

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
