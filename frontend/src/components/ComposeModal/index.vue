<template>
  <div
    class="absolute top-0 left-0 w-full min-h-[100vh] flex justify-center dark:bg-blue-300/20 bg-green-800/20 z-11"
  >
    <n-scrollbar
      style="max-height: 100vh"
      content-style="display: flex; justify-content: center; align-items: center;"
    >
      <div
        class="sm:w-[600px] sm:h-[600px] h-[100vh] sm:rounded-2xl sm:mt-12 w-full p-2 dark:bg-black bg-white"
      >
        <userSendCard :isCompose="true" />
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { NScrollbar } from 'naive-ui'
import userSendCard from '@/components/userSendCard/index.vue'
</script>
