<template>
  <div class="h-full w-full sm:flex sm:justify-center sm:pt-3">
    <div :class="{ 'h-full': windowStore.isMobile }">
      <div
        class="relative w-full border-0 bg-white sm:min-h-fit sm:w-[38rem] sm:rounded-2xl dark:border-gray-800 dark:bg-black sm:dark:border-1"
      >
        <NScrollbar :style="{ maxHeight: windowStore.isMobile ? '100dvh' : '90dvh' }">
          <div
            class="sticky top-0 h-[3.5rem] w-full border-b border-gray-200 backdrop-blur-sm sm:rounded-t-2xl dark:border-gray-800"
          >
            <slot name="header" />
          </div>

          <div class="w-full rounded-xl px-4">
            <slot name="content" />
          </div>

          <div
            class="sticky bottom-0 min-h-[3.5rem] w-full border-t border-gray-200 backdrop-blur-sm sm:rounded-b-2xl dark:border-gray-800"
          >
            <slot name="footer" />
          </div>
        </NScrollbar>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { NScrollbar } from 'naive-ui'

import { useWindowStore } from '@/stores'

const windowStore = useWindowStore()
</script>
