<template>
  <div
    class="mb-4 flex items-center rounded-lg p-4 text-sm shadow-lg transition-all duration-300"
    :class="colorClasses"
    role="alert"
  >
    <svg
      class="me-3 inline h-4 w-4 flex-shrink-0"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
      />
    </svg>
    <span class="font-medium">{{ content }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'info' | 'success' | 'warning' | 'error'
  content: string
}>()

const colorClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400'
    case 'warning':
      return 'text-yellow-800 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300'
    case 'error':
      return 'text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400'
    default:
      return 'text-blue-800 bg-blue-50 dark:bg-gray-800 dark:text-blue-400'
  }
})
</script>
