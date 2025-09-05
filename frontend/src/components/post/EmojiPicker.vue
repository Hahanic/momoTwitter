<template>
  <div ref="pickerContainerRef">
    <emoji-picker :class="themeStore.isDarkTheme ? 'dark' : 'light'"></emoji-picker>
  </div>
</template>

<script setup lang="ts">
import 'emoji-picker-element'

import { onMounted } from 'vue'

import { useThemeStore } from '@/stores'

const themeStore = useThemeStore()
const emit = defineEmits<{
  'emoji-selected': [emoji: string]
}>()

onMounted(() => {
  const picker = document.querySelector('emoji-picker')
  picker?.addEventListener('emoji-click', (event: any) => {
    emit('emoji-selected', event.detail)
  })
})
</script>

<style scoped>
emoji-picker {
  --emoji-size: 1.5rem;
  --input-border-radius: 1rem;
  --border-radius: 0.6rem;
}

.dark emoji-picker {
  --background: #000;
}

@media screen and (max-width: 640px) {
  emoji-picker {
    --num-columns: 6;
    --category-emoji-size: 1.1rem;
  }
}
</style>
