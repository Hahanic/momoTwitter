<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 重命名模态框 -->
    <div v-if="isRenameModal" class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">重命名对话</h3>

      <div class="mb-4">
        <input
          ref="inputRef"
          v-model="newTitle"
          type="text"
          placeholder="输入新的对话标题"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          @keyup.enter="handleRename"
          @keyup.escape="$emit('close')"
        />
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          取消
        </button>
        <button
          @click="handleRename"
          :disabled="!newTitle.trim() || isLoading"
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ isLoading ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-else class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">删除对话</h3>

      <p class="mb-6 text-gray-600 dark:text-gray-400">确定要删除这个对话吗？此操作无法撤销。</p>

      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          取消
        </button>
        <button
          @click="handleDelete"
          :disabled="isLoading"
          class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ isLoading ? '删除中...' : '删除' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { renameConversation, deleteConversation } from '@/api'
import { useMessage } from '@/composables/useMessage'

const emit = defineEmits<{
  close: []
  refresh: [] // 通知父组件刷新数据
}>()

const route = useRoute()
const router = useRouter()
const message = useMessage()

const newTitle = ref('')
const isLoading = ref(false)
const inputRef = ref<HTMLInputElement>()

// 从路由 query 判断是重命名还是删除
const isRenameModal = computed(() => route.query.modal === 'conversationRename')

// 从路由 query 获取对话 ID 和标题（通过 URL 编码传递）
const conversationId = computed(() => route.query.conversationId as string)
const conversationTitle = computed(() => {
  const title = route.query.title as string
  return title ? decodeURIComponent(title) : ''
})

onMounted(async () => {
  // 如果是重命名，设置当前标题并聚焦输入框
  if (isRenameModal.value && conversationTitle.value) {
    newTitle.value = conversationTitle.value
    await nextTick()
    if (inputRef.value) {
      inputRef.value.focus()
      inputRef.value.select()
    }
  }
})

// 处理重命名
const handleRename = async () => {
  if (!newTitle.value.trim() || !conversationId.value) return

  try {
    isLoading.value = true
    await renameConversation(conversationId.value, newTitle.value.trim())

    message.success('重命名成功')
    emit('refresh') // 通知父组件刷新
    emit('close')
  } catch (error) {
    console.error('重命名失败:', error)
    message.error('重命名失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 处理删除
const handleDelete = async () => {
  if (!conversationId.value) return

  try {
    isLoading.value = true
    await deleteConversation(conversationId.value)

    message.success('对话已删除')
    emit('close')

    // 如果删除的是当前正在查看的对话，跳转到 bot 首页
    if (route.params.id === conversationId.value) {
      router.push({ name: 'Bot' })
    } else {
      emit('refresh') // 通知父组件刷新
    }
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>
