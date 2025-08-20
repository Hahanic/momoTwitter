<template>
  <div
    class="group relative flex items-center justify-center rounded-full transition-all hover:cursor-pointer"
    :class="containerClass"
  >
    <img
      :src="src || '/myAvatar.jpg'"
      :alt="alt"
      class="h-full w-full rounded-full object-cover transition-transform duration-300 ease-in-out select-none group-hover:scale-110 group-hover:-rotate-8"
    />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  src?: string
  alt?: string
  containerClass?: string
}

withDefaults(defineProps<Props>(), {
  alt: 'Avatar',
  containerClass: '',
  imageClass: '',
})
</script>

<style scoped></style>
