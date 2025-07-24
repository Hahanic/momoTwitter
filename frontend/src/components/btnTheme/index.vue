<template>
<n-icon
  :size="size"
  @click="themeStore.toggleTheme"
  class="hover:scale-110 transition cursor-pointer"
>
  <Transition name="fade" mode="out-in">
    <SunIcon v-if="!themeStore.isDarkTheme" key="sunicon" class="theme-icon" />
    <MoonIcon v-else key="moonicon" class="theme-icon" />
  </Transition>
</n-icon>
</template>

<script lang="ts" setup>
import { NIcon } from 'naive-ui';
import { MoonIcon, SunIcon } from 'lucide-vue-next'
import usethemeStore from '@/stores/theme'

const themeStore = usethemeStore()

defineProps<{size: string}>()

</script>

<style scoped>
.theme-icon {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.fade-enter-from {
  opacity: 0;
  transform: rotate(0deg) scale(0.8);
}

.fade-leave-to {
  opacity: 0.3;
  transform: rotate(180deg) scale(0.8);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
</style>