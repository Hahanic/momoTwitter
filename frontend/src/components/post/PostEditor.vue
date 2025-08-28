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
      <n-scrollbar :class="scrollbarClass">
        <textarea
          ref="textareaRef"
          v-model="internalContent"
          maxlength="301"
          :placeholder="placeholder"
          @focus="$emit('focus')"
          @blur="$emit('blur')"
          class="textareaEl mt-3 w-full resize-none overflow-y-hidden bg-transparent pr-2 text-[1rem] break-all placeholder-[#808080] placeholder:text-[1.2rem] focus:outline-none"
          :class="textareaClass"
        ></textarea>
      </n-scrollbar>
      <!-- 右侧按钮（仅在未聚焦时显示） -->
      <slot name="right-button"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NScrollbar, useMessage } from 'naive-ui'
import { ref, watch, computed, nextTick, onMounted } from 'vue'

import Avatar from '@/components/post/Avatar.vue'
import { useUserStore } from '@/stores'
const message = useMessage()
const userStore = useUserStore()

interface Props {
  modelValue: string
  placeholder?: string
  scrollbarClass?: string
  textareaClass?: string
  localStorageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '有什么新鲜事?',
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
      message.warning('不能超过300字')
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
  loadFromLocalStorage,
  textareaRef,
})
</script>

<style scoped></style>
