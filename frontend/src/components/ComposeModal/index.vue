<template>
  <div class="absolute top-0 left-0 z-11 flex min-h-[100vh] w-full justify-center bg-green-800/20 dark:bg-blue-300/20">
    <n-scrollbar style="max-height: 100vh" content-style="display: flex; justify-content: center; align-items: center;">
      <div class="h-[100vh] w-full bg-white p-2 sm:mt-12 sm:h-[600px] sm:w-[600px] sm:rounded-2xl dark:bg-black">
        <userSendCard :isCompose="true" />
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { NScrollbar } from 'naive-ui'

import userSendCard from '@/components/post/PostCreate.vue'
</script>
