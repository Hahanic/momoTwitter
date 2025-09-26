<template>
  <!-- 输入区域 -->
  <div class="sticky bottom-0 w-full">
    <Transition name="slide-fade">
      <div v-show="isShowTextarea" class="w-full px-4 pb-1">
        <div class="flex w-full">
          <div
            class="border-borderWhite dark:border-borderDark flex-1 rounded-2xl border-1 bg-white shadow-sm dark:bg-black"
          >
            <!-- TODO： 图片显示区域 -->
            <!-- <div class="w-full px-4 pt-2"></div> -->
            <div class="relative flex pt-3">
              <textarea
                ref="textareaRef"
                v-model="inputMessage"
                @input="adjustHeight"
                :placeholder="props.placeholder"
                rows="1"
                class="w-full resize-none px-4 text-gray-900 placeholder-gray-500 outline-none dark:text-gray-100"
                style="min-height: 40px; max-height: 250px"
              ></textarea>
            </div>
            <div class="flex w-full justify-between px-3 py-2">
              <div class="flex items-center space-x-1">
                <!-- 隐藏 -->
                <div class="flex text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <button @click="isShowTextarea = false" class="p-1">
                    <ChevronsRight :size="20" />
                  </button>
                </div>
                <!-- 文件 -->
                <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
              </div>
              <button
                @click="sendMessage"
                :disabled="!inputMessage.trim() || props.disabled || props.isLoading"
                class="flex items-center space-x-2 rounded-lg bg-blue-500 px-2 py-1 font-medium text-white transition-colors duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-4 sm:py-2 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-500"
              >
                <div
                  v-if="props.disabled"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
                <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <span>{{ props.isLoading ? '发送中...' : '发送' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <div v-show="!isShowTextarea" class="relative flex w-full justify-end">
      <div class="absolute bottom-0 flex p-4 text-gray-500 hover:text-gray-600 dark:hover:text-white">
        <button @click="isShowTextarea = true" class="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
          <ChevronsLeft :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    isLoading?: boolean
    rows?: number
  }>(),
  {
    modelValue: '',
    placeholder: '发送消息...',
    disabled: false,
    rows: 1,
  }
)
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send', message: string): void
}>()

const isShowTextarea = ref(true)
const textareaRef = ref<HTMLTextAreaElement>()
const inputMessage = ref(props.modelValue || '')

// 父变 → 子同步
watch(
  () => props.modelValue,
  (val) => {
    if (val !== inputMessage.value) inputMessage.value = val ?? ''
  }
)
// 子变 → 父同步
watch(inputMessage, (val) => {
  emit('update:modelValue', val)
})

// 发送消息
const sendMessage = () => {
  if (inputMessage.value.trim() === '') return
  // 触发父组件事件
  emit('send', inputMessage.value.trim())
  adjustHeight()
}

// 调整文本区域高度
const adjustHeight = async () => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
}
</script>

<style scoped>
/* 输入框过渡效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(100%);
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateY(0);
}
/* 滚动条样式 */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* 深色模式下的滚动条 */
.dark textarea::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.5);
}

.dark textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.8);
}

/* Firefox 滚动条样式 */
textarea {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.dark textarea {
  scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
}
</style>
