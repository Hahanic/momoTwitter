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

    <!-- 已选择图片预览（回复） -->
    <div v-if="selectedImages.length" class="mt-2 px-4 sm:pl-[3.8rem]">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(img, idx) in selectedImages"
          :key="idx"
          class="group relative h-24 w-24 overflow-hidden rounded-lg border border-dashed border-gray-400 dark:border-gray-600"
        >
          <img :src="img.preview" class="h-full w-full object-cover" />
          <button
            type="button"
            class="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
            @click.stop="removeImage(idx)"
            aria-label="移除图片"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

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
          @files-selected="handleFilesSelected"
          @file-rejected="handleFileRejected"
          :current-count="selectedImages.length"
          :max-count="MAX_IMAGES"
        />
        <SubmitButton :disabled="!canSubmitReply || isUploading" @click="handlePosting" text="回复" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MapPin } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import { ref, computed } from 'vue'

import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { useImageSelection } from '@/composables/useImageSelection'
import { uploadImages } from '@/composables/useMediaUpload'
import { usePostDetailStore } from '@/stores'
import useUserStore from '@/stores/userUserStore'
import useWindowStore from '@/stores/useWindowStore'

const message = useMessage()
const postDetailStore = usePostDetailStore()
const userStore = useUserStore()
const windowStore = useWindowStore()

const hasUserFocused = ref<boolean>(false)
const messageContent = ref<string>('')

const isUploading = ref(false)

// 图片选择与预览（组合式）
const { selectedImages, count, max, addFiles, removeImage, clearAll } = useImageSelection({ max: 4 })
const MAX_IMAGES = max

const handleFilesSelected = (files: File[]) => addFiles(files)
const handleFileRejected = (info: { file: File; reason: string }) => {
  message.warning(info.reason)
}

// 用于提交回复按钮的disabled
const canSubmitReply = computed(() => {
  return (
    (messageContent.value.trim() || count.value > 0) &&
    userStore.isAuthenticated &&
    postDetailStore.currentPostId &&
    !postDetailStore.isLoadingReplies
  )
})

// 发送回复的方法
const handlePosting = async () => {
  if (!messageContent.value.trim() && selectedImages.value.length === 0) {
    message.warning('回复内容或图片不能为空')
    return
  }

  if (!userStore.isAuthenticated) {
    message.warning('请先登录！')
    return
  }

  if (isUploading.value) {
    message.warning('图片正在上传，请稍后再试')
    return
  }

  try {
    let mediaData: Array<{ type: 'image' | 'video' | 'gif'; url: string }> = []

    // 如果有图片，先上传图片（统一入口）
    if (selectedImages.value.length > 0) {
      isUploading.value = true
      const imageCount = selectedImages.value.length
      message.info(`正在上传${imageCount}张图片...`)

      try {
        const files = selectedImages.value.map((i) => i.file)
        mediaData = await uploadImages(files)
      } catch (error: any) {
        message.error(error.message || '图片上传失败')
        throw error
      }
    }

    await postDetailStore.createReply(messageContent.value, mediaData.length ? mediaData : undefined)
    message.success('回复成功！')
    messageContent.value = '' // 清空输入框
    hasUserFocused.value = false // 收起工具栏
  } catch (error: any) {
    message.error(error.message || '回复失败，请稍后再试')
    console.error('回复失败:', error)
  } finally {
    clearAll()
    isUploading.value = false
  }
}

// 用户focus输入框然后显示媒体工具栏和按钮
const handleTextareaFocus = () => {
  hasUserFocused.value = true
}

// 媒体工具栏处理方法
const handleMediaAction = () => {
  // 选择图片逻辑在 MediaToolbar 内
}
</script>

<style scoped></style>
