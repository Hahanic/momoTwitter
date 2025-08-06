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
            :disabled="postStore.isPosting"
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
            @input="handleTextareaInput"
            maxlength="1000"
            :disabled="postStore.isPosting"
            class="mt-3 w-full resize-none overflow-y-hidden bg-transparent pr-2 text-xl break-all placeholder-[#808080] focus:outline-none"
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
            :disabled="postStore.isPosting"
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
import { onMounted, ref } from 'vue'
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
import useUserStore from '@/stores/user'
import usePostStore from '@/stores/post'

const postStore = usePostStore()
const userStore = useUserStore()
const message = useMessage()

interface Props {
  isCompose?: boolean
}
withDefaults(defineProps<Props>(), {
  isCompose: false,
})

const messageContent = ref<string>('')

// 输入框：自适应高度和草稿
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const handleTextareaInput = () => {
  const textarea = textareaRef.value

  if (!textarea) return
  // 限制一千字
  if (messageContent.value.replace(/\s/g, '').length >= 1000) {
    messageContent.value = messageContent.value.slice(0, 1000)
    message.warning('不能超过1000字')
  }
  // 输入框高度：根据内容自适应
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

// 发帖方法
const handlePosting = async () => {
  // 内容为空直接返回
  if (!messageContent.value) return
  // 是否已登陆
  console.log(userStore)
  if (!userStore.isAuthenticated) {
    message.warning('请先登录！')
    return
  }
  // 发帖
  try {
    await postStore.createPost({
      content: messageContent.value,
      postType: 'standard',
    })
    message.success('发帖成功！')
    // 清空输入框
    messageContent.value = ''
    // 清除草稿
    localStorage.removeItem('draftMessage')
  } catch (error: any) {
    message.error(error.message || '发帖失败，请稍后再试')
    console.error(error.message || '发帖失败:')
  }
}

onMounted(() => {
  // 恢复草稿内容
  const draftMessage = localStorage.getItem('draftMessage')
  if (draftMessage) {
    messageContent.value = draftMessage
    setTimeout(() => {
      handleTextareaInput()
    }, 0)
  }
})
</script>

<style scoped></style>
