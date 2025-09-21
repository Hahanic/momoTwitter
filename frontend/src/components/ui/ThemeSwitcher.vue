<template>
  <div
    @click="themeStore.toggleTheme"
    :style="{ width: `${size}px`, height: `${size}px` }"
    class="flex cursor-pointer items-center justify-center transition hover:scale-110"
  >
    <Transition name="fade" mode="out-in">
      <SunIcon v-if="!themeStore.isDarkTheme" :size="iconSize" key="sunicon" class="theme-icon" />
      <MoonIcon v-else :size="iconSize" key="moonicon" class="theme-icon" />
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { MoonIcon, SunIcon } from 'lucide-vue-next'
import { computed } from 'vue'

import usethemeStore from '@/stores/useThemeStore'

const props = defineProps<{ size: string | number }>()

const themeStore = usethemeStore()

const iconSize = computed(() => Number(props.size))
</script>

<style scoped>
.theme-icon {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out;
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
