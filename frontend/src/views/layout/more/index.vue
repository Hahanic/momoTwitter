<template>
<main
  v-show="isLargeScreen || !isChildRouteActive || (!isMobile && !isChildRouteActive)"
  :class="{ 'lg:w-[25rem] w-[15rem]': isLargeScreen, 'w-[38rem]': !isLargeScreen && !isMobile,'w-[100vw]': isMobile }"
  class="border-x-1 dark:border-borderDark border-borderWhite transition-all"
>
  <div class="w-full flex flex-col">
    <div class="w-full flex items-center mx-2 my-3">
      <Settings :size="24"/>
      <p class="text-xl pl-2">设置</p>
    </div>
    <ul>
      <li class="w-full transition-all dark:hover:bg-[#16181c] hover:bg-[#f7f9f9]">
        <RouterLink to="/more/account" class="w-full flex items-center justify-between p-3">
            <p>你的账号</p>
            <span>&gt;</span>
        </RouterLink>
      </li>
      <li class="w-full transition-all dark:hover:bg-[#16181c] hover:bg-[#f7f9f9]">
        <RouterLink to="/more/settings" class="w-full flex items-center justify-between p-3">
            <p>辅助功能、显示和语言</p>
            <span>&gt;</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</main>

<aside
  v-show="isLargeScreen || isChildRouteActive"
  :class="{ 'w-[38rem]': isLargeScreen || (!isLargeScreen && !isMobile && isChildRouteActive), 'w-[100vw]': isMobile && isChildRouteActive, 'ml-7': isLargeScreen }"
  class="md:min-h-screen border-r-1 dark:border-borderDark border-borderWhite h-screen transition-all sticky top-0">
  <RouterView />
</aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import useWindowStore from '@/stores/window'

const route = useRoute()
const windowStore = useWindowStore()

const { isMobile, isLargeScreen } = storeToRefs(windowStore)

const isChildRouteActive = computed(() => {
  return route.path.startsWith('/more/') && route.path !== '/more'
})

</script>

<style scoped>
.router-link-active {
  border-right: 2px solid #1d9bf0;
}
.dark .router-link-active {
  background-color: #16181c;
}
</style>