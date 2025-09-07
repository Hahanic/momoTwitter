<template>
  <main
    v-show="isLargeScreen || !isChildRouteActive || (!isMobile && !isChildRouteActive)"
    :class="{
      'w-[15rem] lg:w-[25rem]': isLargeScreen,
      'w-[38rem]': !isLargeScreen && !isMobile,
      'dark:border-borderDark border-borderWhite border-x-1': !isMobile,
      'w-[100vw]': isMobile,
    }"
    class="transition-all"
  >
    <div class="flex w-full flex-col">
      <div class="my-3 flex w-full items-center px-2">
        <Settings :size="24" />
        <p class="pl-2 text-xl">{{ t('more.settings') }}</p>
      </div>
      <ul>
        <li class="w-full transition-all hover:bg-[#f7f9f9] dark:hover:bg-[#16181c]">
          <RouterLink to="/more/account" class="flex w-full items-center justify-between p-3">
            <p>{{ t('more.yourAccount') }}</p>
            <span>&gt;</span>
          </RouterLink>
        </li>
        <li class="w-full transition-all hover:bg-[#f7f9f9] dark:hover:bg-[#16181c]">
          <RouterLink to="/more/settings" class="flex w-full items-center justify-between p-3">
            <p>{{ t('more.accessibilityDisplayLanguages') }}</p>
            <span>&gt;</span>
          </RouterLink>
        </li>
        <li class="w-full transition-all hover:bg-[#f7f9f9] dark:hover:bg-[#16181c]">
          <RouterLink to="/more/security" class="flex w-full items-center justify-between p-3">
            <p>{{ t('more.security_and_account_access') }}</p>
            <span>&gt;</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </main>

  <aside
    v-show="isLargeScreen || isChildRouteActive"
    :class="{
      'w-[39.75rem]': isLargeScreen,
      'w-[38rem]': !isLargeScreen && !isMobile && isChildRouteActive,
      'w-[100vw]': isMobile && isChildRouteActive,
      'dark:border-borderDark border-borderWhite border-r-1': !isMobile,
    }"
  >
    <RouterView />
  </aside>
</template>

<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import useWindowStore from '@/stores/useWindowStore'

const route = useRoute()
const windowStore = useWindowStore()
const { t } = useI18n()

const { isMobile, isLargeScreen } = storeToRefs(windowStore)

const isChildRouteActive = computed(() => {
  return route.path.startsWith('/more/') && route.path !== '/more'
})
</script>

<style scoped>
.router-link-active {
  border-right: 2px solid #1d9bf0;
}
</style>
