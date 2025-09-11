<template>
  <div class="flex h-[3.2rem] items-center justify-center">
    <div class="dark:border-borderDark relative flex w-full items-center rounded-2xl">
      <SearchIcon :size="17.6" class="absolute left-3" />
      <input
        type="text"
        :placeholder="t('search.placeholder')"
        class="h-[2.4rem] w-full rounded-2xl bg-[#f5f5f5] pr-4 pl-9 text-amber-950 outline-none focus:ring-1 focus:ring-blue-300 dark:bg-[#181818] dark:text-white"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SearchIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped></style>
