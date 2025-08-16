<template>
  <button
    @click="$emit('click')"
    :disabled="disabled"
    :class="{
      'bg-black text-white hover:cursor-pointer dark:bg-white': !disabled,
      'bg-[#87898c] dark:bg-[#787a7a]': disabled,
    }"
    class="h-9 w-14 rounded-4xl font-semibold text-white transition-all dark:text-[#000]"
  >
    {{ text }}
  </button>
</template>

<script lang="ts" setup>
interface Props {
  text?: string
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  text: '发帖',
  disabled: false,
  loading: false,
})

defineEmits<{
  click: []
}>()
</script>

<style scoped></style>
