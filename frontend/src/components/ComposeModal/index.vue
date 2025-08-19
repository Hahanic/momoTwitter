<template>
  <div
    class="absolute top-0 left-0 z-11 flex min-h-[100dvh] w-full justify-center bg-green-800/20 dark:bg-blue-300/20"
    @click="handleBackdropClick"
  ></div>
</template>

<script setup lang="ts">
// 定义 emit 事件
const emit = defineEmits(['close'])

// 点击背景关闭模态框
const handleBackdropClick = () => {
  emit('close')
}
</script>
