<template>
  <div class="fixed top-4 right-[50%] z-100 w-full max-w-fit translate-x-[50%]">
    <TransitionGroup name="list" tag="div">
      <MessageItem v-for="message in messages" :key="message.id" :type="message.type" :content="message.content" />
    </TransitionGroup>
  </div>

  <slot />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import MessageItem from './MessageItem.vue'

import { useMessageStore } from '@/stores/useMessageStore'

const messageStore = useMessageStore()
const { messages } = storeToRefs(messageStore)
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
