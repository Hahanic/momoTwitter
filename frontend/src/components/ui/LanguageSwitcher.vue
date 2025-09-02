<template>
  <div class="language-switcher">
    <select
      v-model="locale"
      @change="switchLanguage"
      class="rounded-md bg-gray-100 p-2 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
    >
      <option value="zh-CN">简体中文</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale)
})

const switchLanguage = (event: Event) => {
  const newLocale = (event.target as HTMLSelectElement).value
  locale.value = newLocale
}
</script>

<style scoped>
.language-switcher select {
  cursor: pointer;
  border: 1px solid #ccc;
  outline: none;
}
</style>
