<template>
  <div
    :class="{
      'border-b-1': !isCompose,
      'flex h-full max-h-[100vh] flex-col': isCompose,
    }"
    class="dark:border-borderDark border-borderWhite w-full"
  >
    <div v-if="isCompose" class="flex items-center justify-between px-2 pt-2 pb-3">
      <RouterLink to="/">
        <ArrowLeft class="block sm:hidden" :size="26" />
        <XIcon class="hidden sm:block" :size="26" />
      </RouterLink>
      <div class="flex items-center gap-4 text-[#1eaafe]">
        <span>草稿</span>
        <div class="block sm:hidden">
          <button
            @click="handlePosting"
            :class="{
              'bg-black text-white hover:cursor-pointer dark:bg-white': !!messageContent,
              'bg-[#87898c] dark:bg-[#787a7a]': !messageContent,
            }"
            class="h-9 w-14 rounded-4xl font-semibold text-white transition-all dark:text-[#000]"
          >
            发帖
          </button>
        </div>
      </div>
    </div>

    <div class="flex" :class="{ 'min-h-0': isCompose }">
      <!-- 头像：适应未登录 -->
      <div>
        <div class="mx-2 mt-2 flex h-[3rem] w-[3rem] items-center justify-center rounded-full">
          <img v-if="userStore.isAuthenticated" class="rounded-full select-none" src="/myAvatar.jpg" />
          <UserCircle2Icon v-else :size="44" class="text-[#71767b]" />
        </div>
      </div>

      <div class="relative h-full w-full">
        <n-scrollbar class="sm:max-h-[600px]">
          <textarea
            ref="textareaRef"
            v-model="messageContent"
            maxlength="301"
            class="textareaEl mt-3 w-full resize-none overflow-y-hidden bg-transparent pr-2 text-xl break-all placeholder-[#808080] focus:outline-none"
            placeholder="有什么新鲜事?"
          ></textarea>
        </n-scrollbar>
      </div>
    </div>

    <div class="flex min-h-[3rem] px-4 sm:pr-[1rem] sm:pl-[3.8rem]">
      <div class="dark:border-borderDark border-borderWhite flex w-full items-center justify-between border-t-1">
        <div class="text-icon1 flex flex-wrap gap-4">
          <button type="button" class="hover:cursor-pointer">
            <Image :size="24" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <SmileIcon :size="24" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <LucideBot :size="24" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <MenuIcon :size="24" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <LocationEdit :size="24" />
          </button>
          <button type="button" class="hover:cursor-pointer">
            <CalendarClockIcon :size="24" />
          </button>
        </div>
        <div :class="{ 'hidden sm:block': isCompose }">
          <button
            @click="handlePosting"
            :disabled="postInteractionStore.isCreatingPost()"
            :class="{
              'bg-black text-white hover:cursor-pointer dark:bg-white': !!messageContent,
              'bg-[#87898c] dark:bg-[#787a7a]': !messageContent,
            }"
            class="h-9 w-14 rounded-4xl font-semibold text-white transition-all dark:text-[#000]"
          >
            发帖
          </button>
        </div>
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
  XIcon,
  ArrowLeft,
  UserCircle2Icon,
} from 'lucide-vue-next'
import { NScrollbar, useMessage } from 'naive-ui'
import { onMounted, ref, watch } from 'vue'

import { usePostFeedStore, usePostInteractionStore } from '@/stores'
import useUserStore from '@/stores/user'

const userStore = useUserStore()
const postFeedStore = usePostFeedStore()
const postInteractionStore = usePostInteractionStore()
const message = useMessage()

interface Props {
  isCompose?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  isCompose: false,
})

const messageContent = ref<string>('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 输入框：自适应高度和清除
watch(
  () => messageContent.value,
  (newValue) => {
    if (!textareaRef.value) return
    // 提交变空
    if (newValue === '') {
      textareaRef.value.style.height = 'auto'
      if (props.isCompose) {
        localStorage.removeItem('messsageContent')
      }
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
    if (props.isCompose) {
      localStorage.setItem('messsageContent', messageContent.value)
    }
  }
)

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
    await postFeedStore.createAndAddPost({
      content: messageContent.value,
      postType: 'standard',
    })

    message.success('发帖成功！')
    // 清空输入框
    messageContent.value = ''
  } catch (error: any) {
    message.error(error.message || '发帖失败，请稍后再试')
    console.error(error.message || '发帖失败:')
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
//     await postStore.createPost({
//       content: messageContent.value,
//       postType: 'standard',
//     })
//     message.success('发帖成功！')
//     // 清空输入框
//     messageContent.value = ''
//   } catch (error: any) {
//     message.error(error.message || '发帖失败，请稍后再试')
//     console.error(error.message || '发帖失败:')
//   }
// }

onMounted(() => {
  // 加载本地缓存的内容
  if (props.isCompose) {
    const savedContent = localStorage.getItem('messsageContent')
    if (savedContent) {
      messageContent.value = savedContent
      setTimeout(() => {
        textareaRef.value!.style.height = 'auto'
        textareaRef.value!.style.height = `${textareaRef.value!.scrollHeight}px`
      }, 0)
    }
  }
})
</script>

<style scoped></style>
