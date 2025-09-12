<template>
  <!-- 背景蒙层 -->
  <div
    class="modal-backdrop fixed inset-0 z-50 bg-white/10 backdrop-blur-sm sm:bg-black/40"
    :class="{ 'dark:bg-black/40': windowStore.isMobile }"
  >
    <component @close="handleClose" :is="currentComponent" />
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
  compose: defineAsyncComponent(() => import('./form/ComposeModal.vue')),
  profile: defineAsyncComponent(() => import('./form/ProfileModal.vue')),
  mobileMenu: defineAsyncComponent(() => import('./MobileMenuModal.vue')),
  ImagePreview: defineAsyncComponent(() => import('./ImagePreviewModal.vue')),
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

<style scoped></style>
