<template>
  <MainContainer>
    <div class="flex min-h-screen w-full flex-col">
      <!-- 顶部区域 -->
      <div class="dark:border-borderDark border-borderWhite sticky top-0 h-12 w-full border-b-1 bg-white dark:bg-black">
        <div class="flex h-full w-full items-center justify-between px-4">
          <button class="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft :size="20" />
          </button>
        </div>
      </div>
      <!-- 聊天消息区域 -->
      <div class="w-full flex-1 px-1 pt-8 pb-24 sm:px-4">
        <div class="w-full space-y-4">
          <!-- 用户消息 -->
          <div class="flex items-start justify-end space-x-3">
            <div class="flex flex-1 justify-end">
              <div class="max-w-3xl rounded-lg px-4 py-3 shadow-sm dark:bg-[#202327]/70">
                <p>感觉前端的文件夹和文件分类有点乱</p>
              </div>
            </div>
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
              <Avatar :src="userStore.user?.avatarUrl" alt="User Avatar" />
            </div>
          </div>
          <!-- AI 消息 -->
          <div class="flex items-start space-x-3">
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
              <img class="h-full w-full" src="/warp.svg" />
            </div>
            <div class="flex-1">
              <div class="max-w-3xl rounded-lg bg-white px-4 py-3 shadow-sm dark:bg-gray-800/50">
                <p class="text-gray-800 dark:text-gray-200">
                  看到你的前端项目文件，我理解你觉得有些混乱的感觉。目前的结构虽然已经有了一定的组织（例如 components,
                  stores, views 分离），但在项目逐渐变大后，确实会遇到可维护性和可读性的挑战。
                  为了让你的项目结构更清晰、更易于维护，我建议采用模块化和关注点分离的原则进行重构。以下是一个更优化的前端文件夹结构建议，并结合你现有的文件进行说明：
                </p>
              </div>
              <span class="mt-1 block text-xs text-gray-500">刚刚</span>
            </div>
          </div>
          <!-- 用户消息 -->
          <div class="flex items-start justify-end space-x-3">
            <div class="flex flex-1 justify-end">
              <div class="max-w-3xl rounded-lg px-4 py-3 shadow-sm dark:bg-[#202327]/70">
                <p>感觉前端的文件夹和文件分类有点乱</p>
              </div>
            </div>
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
              <Avatar :src="userStore.user?.avatarUrl" alt="User Avatar" />
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="sticky bottom-0 w-full bg-white dark:bg-black">
        <div class="w-full p-4">
          <div class="flex w-full">
            <div class="border-borderWhite dark:border-borderDark flex-1 rounded-2xl border-1 shadow-sm">
              <div class="relative flex">
                <textarea
                  ref="textareaRef"
                  v-model="inputMessage"
                  @input="adjustHeight"
                  @keydown.enter.prevent="sendMessage"
                  placeholder="输入消息..."
                  rows="1"
                  class="w-full resize-none px-4 pt-3 text-gray-900 placeholder-gray-500 outline-none dark:text-gray-100"
                  style="min-height: 40px; max-height: 250px"
                ></textarea>
              </div>
              <div class="flex w-full justify-between px-3 py-2">
                <div class="flex items-center space-x-1">
                  <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
                  :disabled="!inputMessage.trim()"
                  class="flex items-center space-x-2 rounded-lg bg-blue-500 px-2 py-1 font-medium text-white transition-colors duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-4 sm:py-2 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-500"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span>发送</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainContainer>

  <StickyAside>
    <div class="dark:border-borderDark border-borderWhite mt-5 h-[400px] w-full border-1"></div>
  </StickyAside>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { ref, nextTick } from 'vue'

import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import Avatar from '@/components/post/Avatar.vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const inputMessage = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

const adjustHeight = async () => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  inputMessage.value = ''
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}
</script>
