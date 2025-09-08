<template>
  <div class="flex">
    <!-- 头像 -->
    <div :class="{ hidden: localStorageKey }" class="mx-2 mt-2 flex h-[3rem] w-[3rem] items-center justify-center">
      <Avatar
        :username="userStore.user?.username"
        :src="userStore.user?.avatarUrl || '/cat.svg'"
        container-class="h-[3rem] w-[3rem]"
      />
    </div>

    <!-- 输入框区域 -->
    <div class="relative flex h-full w-full items-center">
      <Scrollbar visibility="always" :propsClass="scrollbarClass" class="flex-1">
        <textarea
          ref="textareaRef"
          v-model="internalContent"
          maxlength="301"
          :placeholder="props.placeholder"
          @focus="(updateCursorPosition, $emit('focus'))"
          @blur="(updateCursorPosition, $emit('blur'))"
          @keyup="updateCursorPosition"
          @click="updateCursorPosition"
          class="textareaEl mt-3 w-full resize-none overflow-y-hidden bg-transparent pr-2 text-[1rem] break-all placeholder-[#808080] placeholder:text-[1.2rem] focus:outline-none"
          :class="textareaClass"
        ></textarea>
      </Scrollbar>
      <!-- 右侧按钮（仅在未聚焦时显示） -->
      <slot name="right-button"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import Scrollbar from '../common/Scrollbar.vue'

import Avatar from '@/components/post/Avatar.vue'
import { useMessage } from '@/composables/useMessage'
import { useUserStore } from '@/stores'

const message = useMessage()
const userStore = useUserStore()
const { t } = useI18n()

interface Props {
  modelValue: string
  placeholder?: string
  scrollbarClass?: string
  textareaClass?: string
  localStorageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  scrollbarClass: 'sm:max-h-[600px]',
  textareaClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
  blur: []
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 内部内容管理
const internalContent = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

// 记录最后一次光标
const lastCursorPosition = ref(0)

const updateCursorPosition = () => {
  if (!textareaRef.value) return
  lastCursorPosition.value = textareaRef.value.selectionStart
}
// 插入表情
const insertEmoji = (emoji: any) => {
  if (!textareaRef.value) return
  const textarea = textareaRef.value
  const start = lastCursorPosition.value
  const end = lastCursorPosition.value

  // 拼接字符串
  const currentText = internalContent.value
  internalContent.value = currentText.slice(0, start) + emoji + currentText.slice(end)

  // 插入后，更新光标位置到插入文本的后面，并重新聚焦
  const newCursorPosition = start + emoji.length
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(newCursorPosition, newCursorPosition)
    lastCursorPosition.value = newCursorPosition // 更新保存的位置
  })
}

// 监听内容变化，自适应高度
watch(
  () => internalContent.value,
  (newValue) => {
    if (!textareaRef.value) return

    // 提交变空
    if (newValue === '') {
      textareaRef.value.style.height = 'auto'
      if (props.localStorageKey) {
        localStorage.removeItem(props.localStorageKey)
      }
      return
    }

    // 限制三百字
    if (newValue.length >= 301) {
      internalContent.value = newValue.slice(0, 300)
      message.warning(t('post.maxLengthWarning'))
    }

    // 输入框高度：根据内容自适应
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`

    // 本地存储
    if (props.localStorageKey) {
      localStorage.setItem(props.localStorageKey, internalContent.value)
    }
  }
)

// 加载本地缓存内容
const loadFromLocalStorage = () => {
  if (props.localStorageKey) {
    const savedContent = localStorage.getItem(props.localStorageKey)
    if (savedContent) {
      internalContent.value = savedContent
      nextTick(() => {
        if (textareaRef.value) {
          textareaRef.value.style.height = 'auto'
          textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
        }
      })
    }
  }
}

onMounted(() => {
  loadFromLocalStorage()
})

// 暴露方法
defineExpose({
  textareaRef,
  insertEmoji,
})
</script>

<style scoped></style>
