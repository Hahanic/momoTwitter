<template>
  <!-- 背景蒙层 -->
  <div class="modal-backdrop fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" @click.self="handleClose">
    <!-- 模态框容器包装器 -->
    <div
      :class="windowStore.isMobile ? 'p-0' : 'p-2'"
      class="flex min-h-full items-start justify-center"
      @click.self="handleClose"
    >
      <!-- 模态框容器 -->
      <div
        :class="[
          windowStore.isMobile
            ? 'modal-mobile min-h-[100dvh] w-full'
            : 'modal-desktop my-2 max-h-[100dvh] min-h-[200px] w-full max-w-[600px]',
          'transition-all duration-300 ease-out',
        ]"
        class="flex flex-col border-0 bg-white sm:rounded-xl dark:border-1 dark:border-gray-800 dark:bg-black"
        @click.stop
      >
        <!-- 模态框内容区域 -->
        <div class="flex h-full min-h-0 w-full flex-col">
          <!-- 顶部标题栏 -->
          <div
            class="flex h-[3.5rem] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white sm:rounded-t-xl dark:border-gray-800 dark:bg-black"
          >
            <!-- 关闭按钮 -->
            <button
              @click="handleClose"
              class="flex items-center justify-center rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- 标题 -->
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ getModalTitle() }}
            </h2>

            <div class="h-9 w-9"></div>
          </div>

          <!-- 主要内容区域 -->
          <div class="min-h-0 flex-1">
            <n-scrollbar :style="{ maxHeight: windowStore.isMobile ? 'calc(100dvh - 7rem)' : 'calc(100vh - 200px)' }">
              <div :class="[windowStore.isMobile ? 'p-4' : 'p-6']">
                <!-- 根据不同类型的模态框显示不同内容 -->
                <slot name="content">
                  <div class="space-y-4">
                    <div class="flex items-center justify-center text-gray-500 dark:text-gray-400">模态框内容区域</div>
                    <div v-for="i in 10" :key="i" class="rounded border border-gray-200 p-4 dark:border-gray-800">
                      示例内容 {{ i }} - 这是一个测试内容，用于验证滚动功能是否正常工作。
                    </div>
                  </div>
                </slot>
              </div>
            </n-scrollbar>
          </div>

          <!-- 底部操作栏 -->
          <div
            v-if="true"
            class="h-[3.5rem] flex-shrink-0 border-t border-gray-200 sm:rounded-b-xl dark:border-gray-800"
          >
            <slot name="footer">
              <div class="flex h-full items-center justify-end space-x-3 pr-3">
                <button
                  @click="handleClose"
                  class="h-[2.6rem] rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  class="h-[2.6rem] rounded-md border border-transparent bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                  确认
                </button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NScrollbar } from 'naive-ui'

import { useWindowStore } from '@/stores'

const windowStore = useWindowStore()

// 定义 props
const props = withDefaults(
  defineProps<{
    modalType: string
    title?: string
  }>(),
  {
    title: '',
  }
)

// 定义 emit 事件
const emit = defineEmits(['close'])

// 获取模态框标题
const getModalTitle = () => {
  if (props.title) return props.title

  switch (props.modalType) {
    case 'compose':
      return '撰写推文'
    case 'editProfile':
      return '编辑资料'
    case 'reply':
      return '回复推文'
    default:
      return '模态框'
  }
}

// 关闭模态框
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* 背景蒙层淡入动画 */
.modal-backdrop {
  animation: backdropFadeIn 0.3s ease-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 桌面端模态框弹出动画 */
.modal-desktop {
  animation: modalDesktopSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: center;
}

@keyframes modalDesktopSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 移动端模态框滑入动画 */
.modal-mobile {
  animation: modalMobileSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
  transform-origin: bottom;
}

@keyframes modalMobileSlideIn {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
