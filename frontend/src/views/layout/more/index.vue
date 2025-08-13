<template>
  <main
    v-show="isLargeScreen || !isChildRouteActive || (!isMobile && !isChildRouteActive)"
    :class="{
      'w-[15rem] lg:w-[25rem]': isLargeScreen,
      'w-[38rem]': !isLargeScreen && !isMobile,
      'w-[100vw]': isMobile,
    }"
    class="dark:border-borderDark border-borderWhite border-x-1 transition-all"
  >
    <div class="flex w-full flex-col">
      <div class="mx-2 my-3 flex w-full items-center">
        <Settings :size="24" />
        <p class="pl-2 text-xl">设置</p>
      </div>
      <ul>
        <li class="w-full transition-all hover:bg-[#f7f9f9] dark:hover:bg-[#16181c]">
          <RouterLink to="/more/account" class="flex w-full items-center justify-between p-3">
            <p>你的账号</p>
            <span>&gt;</span>
          </RouterLink>
        </li>
        <li class="w-full transition-all hover:bg-[#f7f9f9] dark:hover:bg-[#16181c]">
          <RouterLink to="/more/settings" class="flex w-full items-center justify-between p-3">
            <p>辅助功能、显示和语言</p>
            <span>&gt;</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </main>

  <aside
    v-show="isLargeScreen || isChildRouteActive"
    :class="{
      'w-[38rem]': isLargeScreen || (!isLargeScreen && !isMobile && isChildRouteActive),
      'w-[100vw]': isMobile && isChildRouteActive,
      'ml-7 pr-7': isLargeScreen,
    }"
    class="dark:border-borderDark border-borderWhite sticky top-0 h-screen border-r-1 transition-all md:min-h-screen"
  >
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
