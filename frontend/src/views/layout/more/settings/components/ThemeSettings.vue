<template>
  <div class="px-4 py-2">
    <div class="rounded-lg border border-gray-200 p-4 shadow-lg dark:border-gray-700">
      <p class="mb-2 font-semibold">{{ t('more.ability.display.background.title') }}</p>
      <div class="flex items-center justify-around gap-2">
        <button
          @click="themeStore.toggleTheme"
          :class="[
            'flex-1 rounded-md bg-black p-2 text-white hover:bg-gray-900',
            themeStore.currentTheme === 'dark' ? 'ring-2 ring-blue-500' : '',
          ]"
        >
          {{ t('more.ability.display.background.dark') }}
        </button>
        <button
          @click="themeStore.toggleTheme"
          :class="[
            'flex-1 rounded-md bg-white p-2 text-black',
            themeStore.currentTheme === 'light' ? 'ring-2 ring-blue-500' : '',
          ]"
        >
          {{ t('more.ability.display.background.light') }}
        </button>
        <button
          :class="[
            'flex-1 rounded-md bg-gray-800 p-2 text-white hover:bg-gray-700',
            !themeStore.currentTheme ? 'ring-2 ring-blue-500' : '',
          ]"
        >
          {{ t('more.ability.display.background.dim') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useThemeStore } from '@/stores'

const { t } = useI18n()
const themeStore = useThemeStore()
</script>
