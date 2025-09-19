<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="bg-opacity-50 fixed inset-0 z-999 flex items-center justify-center bg-black/40 dark:bg-black/60"
        @click.self="$emit('close')"
      >
        <div
          class="border-borderWhite dark:border-borderDark mx-4 w-full max-w-md rounded-2xl border-1 bg-white p-6 shadow-lg dark:bg-black"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            <slot name="title"></slot>
          </h3>
          <slot name="message"></slot>
          <div class="flex items-center justify-end space-x-2">
            <slot name="buttons"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
defineEmits(['close'])
defineProps<{
  show: boolean
}>()
</script>
<style>
/* 模态框动画效果 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease-out;
}
.modal-fade-enter-from {
  opacity: 0;
}
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

.modal-fade-enter-active .mx-4,
.modal-fade-leave-active .mx-4 {
  transition: transform 0.3s ease-out;
}
.modal-fade-enter-from .mx-4 {
  transform: scale(0.9) translateY(-20px);
}
.modal-fade-leave-to .mx-4 {
  transform: scale(0.9) translateY(-20px);
}
.modal-fade-enter-to .mx-4,
.modal-fade-leave-from .mx-4 {
  transform: scale(1) translateY(0);
}
</style>
