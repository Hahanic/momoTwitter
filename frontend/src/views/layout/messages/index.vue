<template>
  <MainContainer>
    <div class="flex w-full items-center justify-center">
      <div class="py-20 text-center">写</div>
    </div>
  </MainContainer>

  <StickyAside>
    <div class="flex h-full w-full items-center justify-center border-1">404</div>
  </StickyAside>
</template>

<script setup lang="ts">
import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
</script>

<style scoped></style>
