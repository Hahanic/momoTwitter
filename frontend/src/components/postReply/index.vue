<template>
  <div class="dark:border-borderDark border-borderWhite w-full border-b">
    <div class="flex">
      <!-- 头像 -->
      <div class="mt-2 mr-2 ml-2 flex max-h-[3rem] max-w-[3rem] items-center justify-center rounded-full">
        <img v-if="userStore.isAuthenticated" class="rounded-full select-none" src="/myAvatar.jpg" />
        <UserCircle2Icon v-else :size="44" class="text-[#71767b]" />
      </div>
      <!-- 文本框 -->
      <div class="relative flex h-full w-full items-center">
        <n-scrollbar class="sm:max-h-[230px]">
          <textarea
            ref="textareaRef"
            v-model="messageContent"
            maxlength="301"
            @focus="handleTextareaFocus"
            class="textareaEl mt-3 h-[2rem] w-full resize-none overflow-y-hidden bg-transparent pr-2 text-[1rem] break-all placeholder-[#808080] placeholder:text-[1.2rem] focus:outline-none"
            placeholder="发布你的回复"
          ></textarea>
        </n-scrollbar>
        <button
          v-if="!hasUserFocused"
          class="mt-1 mr-4 h-9 w-14 rounded-4xl bg-[#87898c] font-semibold text-white dark:bg-[#787a7a] dark:text-[#000]"
        >
          回复
        </button>
      </div>
    </div>

    <div class="min-h-[3rem] px-4 sm:pr-[1rem] sm:pl-[3.8rem]" :class="{ 'mt-3 max-h-[6rem]': hasUserFocused }">
      <!-- 地点 -->
      <div
        :class="{ 'pl-[3.5rem]': windowStore.isMobile && !hasUserFocused }"
        class="text-icon2 flex h-[1.5rem] w-full items-center"
      >
        <MapPin :size="20" />
        <span class="text-[1rem] font-bold">&nbsp;都市&nbsp;H公司</span>
      </div>
      <!-- 横线 -->
      <div class="dark:border-borderDark border-borderWhite mt-2 w-full border-t-1"></div>

      <div v-show="hasUserFocused" class="flex w-full items-center justify-between pt-2 pb-4 transition-all">
        <div class="text-icon1 flex flex-wrap gap-4">
          <button type="button" class="hover:cursor-pointer">
            <Image :size="20" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <SmileIcon :size="20" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <LucideBot :size="20" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <MenuIcon :size="20" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <LocationEdit :size="20" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <CalendarClockIcon :size="20" />
          </button>
        </div>
        <button
          @click="handlePosting"
          :class="{
            'bg-black text-white hover:cursor-pointer dark:bg-white': !!messageContent,
            'bg-[#87898c] dark:bg-[#787a7a]': !messageContent,
          }"
          class="h-9 w-14 rounded-4xl font-semibold text-white transition-all dark:text-[#000]"
        >
          回复
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  Image,
  LucideBot,
  MenuIcon,
  LocationEdit,
  CalendarClockIcon,
  SmileIcon,
  UserCircle2Icon,
  MapPin,
} from 'lucide-vue-next'
import { NScrollbar, useMessage } from 'naive-ui'
import { ref, watch } from 'vue'

import { usePostDetailStore } from '@/stores'
import useUserStore from '@/stores/user'
import useWindowStore from '@/stores/window'

const postDetailStore = usePostDetailStore()
const userStore = useUserStore()
const windowStore = useWindowStore()
const message = useMessage()

const messageContent = ref<string>('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const hasUserFocused = ref<boolean>(false)

// 输入框：自适应高度和清除
watch(
  () => messageContent.value,
  (newValue) => {
    if (!textareaRef.value) return
    // 提交变空
    if (newValue === '') {
      textareaRef.value.style.height = 'auto'
      return
    }
    // 限制三百字
    if (newValue.length >= 301) {
      messageContent.value = newValue.slice(0, 300)
      message.warning('不能超过300字')
    }
    // 输入框高度：根据内容自适应
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
)

// 处理 textarea focus 事件
const handleTextareaFocus = () => {
  hasUserFocused.value = true
}

// 发帖方法
const handlePosting = async () => {
  // 内容为空直接返回
  if (!messageContent.value) return
  // 是否已登陆
  if (!userStore.isAuthenticated) {
    message.warning('请先登录！')
    return
  }
  // 发帖
  try {
    await postDetailStore.createReply(messageContent.value)
    message.success('回复成功！')
    // 清空输入框
    messageContent.value = ''
  } catch (error: any) {
    message.error(error.message || '回复失败，请稍后再试')
    console.error(error.message || '回复失败:')
  }
}
// const handlePosting = async () => {
//   // 内容为空直接返回
//   if (!messageContent.value) return
//   // 是否已登陆
//   if (!userStore.isAuthenticated) {
//     message.warning('请先登录！')
//     return
//   }
//   // 发帖
//   try {
//     await replyStore.createReply(messageContent.value)
//     message.success('回复成功！')
//     // 清空输入框
//     messageContent.value = ''
//   } catch (error: any) {
//     message.error(error.message || '回复失败，请稍后再试')
//     console.error(error.message || '回复失败:')
//   }
// }
</script>

<style scoped></style>
