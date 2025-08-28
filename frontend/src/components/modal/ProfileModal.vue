<template>
  <FormModal>
    <template #header>
      <div class="flex h-full w-full items-center justify-between px-2">
        <div class="flex items-center gap-8">
          <button @click="handleClose" class="cursor-pointer rounded-full p-1 transition-colors hover:bg-blue-500/30">
            <X />
          </button>
          <p class="text-[1.1rem] font-bold">编辑个人资料</p>
        </div>
        <div class="pr-1">
          <p class="cursor-pointer text-blue-400">保存</p>
        </div>
      </div>
    </template>
    <template #content>
      <div class="flex flex-col">
        <!-- 顶部banner -->
        <div class="h-40 w-full bg-gray-200 dark:bg-gray-800">
          <img class="h-full w-full object-cover" :src="userStore.currentUserProfile?.bannerUrl || '/banner.gif'" />
        </div>
        <!-- 头像 -->
        <div
          class="-mt-14 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gray-100 dark:border-black dark:bg-gray-900"
        >
          <img
            class="h-full w-full rounded-full object-cover"
            :src="userStore.currentUserProfile?.avatarUrl || '/cat.svg'"
          />
        </div>
        <!-- 资料 -->
        <div class="flex flex-col gap-6">
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
        </div>
      </div>
    </template>
    <template #footer> </template>
  </FormModal>
</template>
<script setup lang="ts">
import { X } from 'lucide-vue-next'

import FormModal from './FormModal.vue'

import { useUserStore } from '@/stores'

const userStore = useUserStore()

const handleClose = () => {
  emit('close')
}
const emit = defineEmits(['close'])
</script>
