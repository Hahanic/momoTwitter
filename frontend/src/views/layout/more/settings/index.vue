<template>
  <div class="w-full">
    <div class="relative flex h-[64px] w-full items-center">
      <img
        @click="themeStore.toggleTheme()"
        class="absolute left-[24px] h-[2.3rem] w-[2.3rem] hover:cursor-pointer xl:left-[59px]"
        src="/warp.svg"
      />
    </div>
    <LanguageSwitcher />
  </div>
</template>

<script setup lang="ts">
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import { useThemeStore } from '@/stores'

const themeStore = useThemeStore()
</script>

<style scoped></style>
