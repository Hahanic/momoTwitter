<template>
  <div v-if="isSender" class="flex flex-col items-end space-y-2">
    <div class="flex items-end space-x-2">
      <div class="flex flex-col items-end">
        <p class="text-[0.9rem] font-medium">{{ displayName }}</p>
        <span class="block text-xs text-gray-500">{{ timestamp }}</span>
      </div>
      <div class="flex h-10 w-10 items-center justify-center rounded-full">
        <Avatar class="h-full w-full" :username="username" :src="avatarUrl" alt="User Avatar" />
      </div>
    </div>
    <div class="flex" :class="isHtmlContent ? '' : 'pr-6'">
      <div class="rounded-lg px-4 py-3 shadow-sm dark:bg-[#202327]/70">
        <p class="whitespace-pre-wrap">{{ content }}</p>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col items-start space-y-2">
    <div class="flex items-end space-x-2">
      <div class="flex h-10 w-10 items-center justify-center rounded-full">
        <Avatar class="h-full w-full" :username="username" :src="avatarUrl" alt="Peer Avatar" />
      </div>
      <div class="flex flex-col items-start">
        <p class="text-[0.9rem] font-medium">{{ displayName }}</p>
        <span class="block text-xs text-gray-500">{{ timestamp }}</span>
      </div>
    </div>
    <div class="flex-1" :class="isHtmlContent ? '' : 'pl-4'">
      <div
        v-if="isHtmlContent"
        class="markdown-body rounded-lg bg-white px-4 py-3 shadow-sm dark:bg-gray-800/30"
        v-html="content"
      ></div>
      <div v-else class="rounded-lg bg-white px-4 py-3 shadow-sm dark:bg-gray-800/30">
        <p class="whitespace-pre-wrap">{{ content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from './Avatar.vue'

withDefaults(
  defineProps<{
    isSender: boolean
    content: string
    timestamp: string
    avatarUrl?: string
    displayName?: string
    username?: string
    isHtmlContent?: boolean
  }>(),
  {
    avatarUrl: '/cat.svg',
    displayName: '',
  }
)
</script>

<style scoped>
/* 1. 基础容器样式 */
.markdown-body {
  line-height: 1.7;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* 2. 代码块样式 */
.markdown-body :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

/* 3. 行内代码样式 */
.markdown-body :deep(code) {
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
  font-size: 95%;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* 4. 表格样式 */
.markdown-body :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.dark .markdown-body :deep(pre) {
  background-color: #161b22;
  margin-top: 10px;
  margin-bottom: 10px;
}

.dark .markdown-body :deep(code) {
  background-color: rgba(110, 118, 129, 0.4);
}

.dark .markdown-body :deep(pre code) {
  background-color: transparent;
}

.dark .markdown-body :deep(th),
.dark .markdown-body :deep(td) {
  border-color: #444c56;
}
</style>
