<script setup lang="ts">
import { NConfigProvider, NScrollbar, NMessageProvider, NLoadingBarProvider, darkTheme, lightTheme } from 'naive-ui';
import usethemeStore from './stores/theme';

const themeStore = usethemeStore()
</script>

<template>
<NMessageProvider>
  <n-config-provider :theme="themeStore.isDarkTheme ? darkTheme : lightTheme">
    <n-loading-bar-provider>
      <n-scrollbar style="max-height: 100vh">
        <RouterView />
      </n-scrollbar>
    </n-loading-bar-provider>
  </n-config-provider>
</NMessageProvider>
</template>

<style>
</style>