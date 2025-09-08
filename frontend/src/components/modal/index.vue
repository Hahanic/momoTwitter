<template>
  <!-- 背景蒙层 -->
  <div
    class="modal-backdrop fixed inset-0 z-50 bg-white backdrop-blur-sm sm:bg-black/40"
    :class="{ 'dark:bg-black/40': windowStore.isMobile }"
  >
    <component
      :class="!windowStore.isMobile ? 'modal-desktop' : 'modal-mobile'"
      @close="handleClose"
      :is="currentComponent"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, shallowRef, watch, type Component } from 'vue'

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

// 定义模态框内容映射
const modalContentMap = {
  compose: defineAsyncComponent(() => import('./ComposeModal.vue')),
  profile: defineAsyncComponent(() => import('./ProfileModal.vue')),
  menu: defineAsyncComponent(() => import('./MenuModal.vue')),
}
// 存储组件实例
const currentComponent = shallowRef<Component | null>(null)
// 监听props.modalType的变化
watch(
  () => props.modalType,
  (newType) => {
    if (newType && modalContentMap[newType as keyof typeof modalContentMap]) {
      currentComponent.value = modalContentMap[newType as keyof typeof modalContentMap]
    } else {
      currentComponent.value = null
    }
  },
  { immediate: true }
)

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
  animation: modalMobileMenuSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
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

@keyframes modalMobileMenuSlideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
