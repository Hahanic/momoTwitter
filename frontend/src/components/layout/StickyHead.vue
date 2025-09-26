<template>
  <transition name="slide-down">
    <div
      v-show="!windowStore.isMobile || (windowStore.isShowTopNav && windowStore.isMobile)"
      class="dark:border-borderDark border-borderWhite sticky top-0 z-10 w-full border-b-1 bg-[#ffffff]/80 backdrop-blur-lg dark:bg-[#000]/80 dark:backdrop-blur-sm"
    >
      <slot />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { useWindowStore } from '@/stores'

const windowStore = useWindowStore()
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}
.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
}
</style>
