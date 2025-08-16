<template>
  <div class="dark:border-borderDark border-borderWhite w-full border-b">
    <!-- 输入框区域 -->
    <PostEditor
      v-model="messageContent"
      :scrollbar-class="'sm:max-h-[230px]'"
      :textarea-class="'h-[2rem] leading-[1.4rem] tracking-[1.2px]'"
      placeholder="发布你的回复"
      @focus="handleTextareaFocus"
    >
      <template #right-button>
        <SubmitButton v-if="!hasUserFocused" :disabled="true" text="回复" class="mt-1 mr-4" />
      </template>
    </PostEditor>

    <!-- 地点和工具栏 -->
    <div class="min-h-[3rem] px-4 sm:pr-[1rem] sm:pl-[3.8rem]" :class="{ 'mt-3 max-h-[6rem]': hasUserFocused }">
      <!-- 地点信息 -->
      <div
        :class="{ 'pl-[3.5rem]': windowStore.isMobile && !hasUserFocused }"
        class="text-icon2 flex h-[1.5rem] w-full items-center"
      >
        <MapPin :size="20" />
        <span class="text-[1rem] font-bold">&nbsp;都市&nbsp;H公司</span>
      </div>

      <!-- 分隔线 -->
      <div class="dark:border-borderDark border-borderWhite mt-2 w-full border-t-1"></div>

      <!-- 展开的工具栏 -->
      <div v-show="hasUserFocused" class="flex w-full items-center justify-between pt-2 pb-4 transition-all">
        <MediaToolbar
          :icon-size="20"
          @image="handleMediaAction"
          @emoji="handleMediaAction"
          @bot="handleMediaAction"
          @menu="handleMediaAction"
          @location="handleMediaAction"
          @calendar="handleMediaAction"
        />
        <SubmitButton :disabled="!canSubmitReply" @click="handlePosting" text="回复" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MapPin } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import { ref, computed } from 'vue'

import MediaToolbar from '@/components/ui/MediaToolbar/index.vue'
import PostEditor from '@/components/ui/PostEditor/index.vue'
import SubmitButton from '@/components/ui/SubmitButton/index.vue'
import { usePostDetailStore } from '@/stores'
import useUserStore from '@/stores/user'
import useWindowStore from '@/stores/window'

const message = useMessage()
const postDetailStore = usePostDetailStore()
const userStore = useUserStore()
const windowStore = useWindowStore()

const hasUserFocused = ref<boolean>(false)
const messageContent = ref<string>('')

// 用于提交回复按钮的disabled
const canSubmitReply = computed(() => {
  return (
    messageContent.value.trim() &&
    userStore.isAuthenticated &&
    postDetailStore.currentPostId &&
    !postDetailStore.isLoadingReplies
  )
})

// 发送回复的方法
const handlePosting = async () => {
  if (!messageContent.value.trim()) {
    message.warning('回复内容不能为空')
    return
  }

  if (!userStore.isAuthenticated) {
    message.warning('请先登录！')
    return
  }

  try {
    await postDetailStore.createReply(messageContent.value)
    message.success('回复成功！')
    messageContent.value = '' // 清空输入框
    hasUserFocused.value = false // 收起工具栏
  } catch (error: any) {
    message.error(error.message || '回复失败，请稍后再试')
    console.error(error.message || error)
  }
}

// 用户focus输入框然后显示媒体工具栏和按钮
const handleTextareaFocus = () => {
  hasUserFocused.value = true
}

// 媒体工具栏处理方法
const handleMediaAction = () => {
  // TODO: 实现媒体功能
  console.log('媒体功能待实现')
}
</script>

<style scoped></style>
