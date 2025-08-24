<template>
  <div class="text-icon1 flex flex-wrap gap-4" :class="containerClass">
    <div class="flex">
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept="image/*"
        :multiple="allowMultiple"
        @change="onFileChange"
      />
      <button type="button" class="hover:cursor-pointer" @click="triggerFilePicker">
        <Image :size="iconSize" />
      </button>
    </div>
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
import { ref } from 'vue'

interface Props {
  iconSize?: number
  containerClass?: string
  allowMultiple?: boolean
  maxCount?: number
  currentCount?: number
  maxSizeMB?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 24,
  containerClass: '',
  allowMultiple: true,
  maxCount: 4,
  currentCount: 0,
  maxSizeMB: 5,
})

const emit = defineEmits<{
  emoji: []
  bot: []
  menu: []
  location: []
  calendar: []
  'files-selected': [files: File[]]
  'file-rejected': [info: { file: File; reason: string }]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFilePicker = () => {
  fileInputRef.value?.click()
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files)
  const accepted: File[] = []
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      emit('file-rejected', { file, reason: '仅支持图片文件' })
      continue
    }
    if (file.size > props.maxSizeMB * 1024 * 1024) {
      emit('file-rejected', { file, reason: `图片不能超过${props.maxSizeMB}MB` })
      continue
    }
    if (props.currentCount + accepted.length >= props.maxCount) {
      emit('file-rejected', { file, reason: `最多只能选择${props.maxCount}张图片` })
      continue
    }
    accepted.push(file)
  }

  if (accepted.length) emit('files-selected', accepted)
  input.value = ''
}
</script>

<style scoped></style>
