<template>
  <div class="px-4 py-2">
    <ul class="rounded-lg shadow-lg">
      <li
        v-for="lang in languages"
        :key="lang.code"
        @click="setLanguage(lang.code)"
        class="cursor-pointer text-start transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span class="block py-1 pl-4" :class="locale === lang.code ? 'font-semibold' : ''">
          {{ lang.name }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
]

const setLanguage = (langCode: string) => {
  locale.value = langCode
  localStorage.setItem('locale', langCode)
}
</script>
