<template>
  <div class="text-icon1 flex flex-wrap gap-4" :class="containerClass">
    <button type="button" class="hover:cursor-pointer" @click="$emit('image')">
      <Image :size="iconSize" />
    </button>
    <button type="button" class="hover:cursor-pointer" @click="$emit('emoji')">
      <SmileIcon :size="iconSize" />
    </button>
    <button type="button" class="hover:cursor-pointer" @click="$emit('bot')">
      <LucideBot :size="iconSize" />
    </button>
    <button type="button" class="hover:cursor-pointer" @click="$emit('menu')">
      <MenuIcon :size="iconSize" />
    </button>
    <button type="button" class="hover:cursor-pointer" @click="$emit('location')">
      <LocationEdit :size="iconSize" />
    </button>
    <button type="button" class="hover:cursor-pointer" @click="$emit('calendar')">
      <CalendarClockIcon :size="iconSize" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Image, LucideBot, MenuIcon, LocationEdit, CalendarClockIcon, SmileIcon } from 'lucide-vue-next'

interface Props {
  iconSize?: number
  containerClass?: string
}

withDefaults(defineProps<Props>(), {
  iconSize: 24,
  containerClass: '',
})

defineEmits<{
  image: []
  emoji: []
  bot: []
  menu: []
  location: []
  calendar: []
}>()
</script>

<style scoped></style>
