<template>
  <main
    :class="{ 'dark:border-borderDark border-borderWhite border-x-1': !windowStore.isMobile }"
    class="w-full sm:w-[38rem]"
  >
    <slot />
  </main>
</template>

<script setup lang="ts">
import { useWindowStore } from '@/stores'
const windowStore = useWindowStore()
</script>

<style scoped></style>
