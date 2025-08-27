<template>
  <FormModal>
    <template #header>
      <div class="flex h-full w-full items-center justify-between px-2">
        <button @click="handleClose" class="cursor-pointer rounded-full p-1 transition-colors hover:bg-blue-500/30">
          <X />
        </button>
        <div class="pr-1">
          <p class="cursor-pointer text-blue-400">草稿</p>
        </div>
      </div>
    </template>
    <template #content>
      <PostEditor
        local-storage-key="messsageContent"
        v-model="messageContent"
        :scrollbarClass="'min-h-[250px] sm:max-h-[60dvh] max-h-[80dvh]'"
      />
      <PostImagePre :images="selectedImages" @remove-image="removeImage" @reorder-images="handleReorderImages" />
    </template>
    <template #footer>
      <div class="flex justify-between p-2">
        <MediaToolbar
          @files-selected="handleFilesSelected"
          @file-rejected="handleFileRejected"
          :current-count="selectedImages.length"
          :max-count="MAX_IMAGES"
        />
        <SubmitButton
          :disabled="!canSubmitPost || postInteractionStore.isCreatingPost() || isUploading"
          @click="handlePosting"
          text="发帖"
        />
      </div>
    </template>
  </FormModal>
</template>
<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import { computed, ref } from 'vue'

import MediaToolbar from '../post/MediaToolbar.vue'
import PostEditor from '../post/PostEditor.vue'
import PostImagePre from '../post/PostImagePre.vue'
import SubmitButton from '../post/SubmitButton.vue'

import FormModal from './FormModal.vue'

import { useImageSelection } from '@/composables/useImageSelection'
import { handleFileUpload } from '@/composables/useMediaUpload'
import { useUserStore, usePostInteractionStore, usePostFeedStore } from '@/stores'

const emit = defineEmits(['close'])

const message = useMessage()
const userStore = useUserStore()
const postInteractionStore = usePostInteractionStore()
const postFeedStore = usePostFeedStore()

const messageContent = ref<string>('')

const isUploading = ref(false)

// 图片选择与预览（提取为组合式函数）
const { selectedImages, count, max, removeImage, addFiles, clearAll } = useImageSelection({ max: 4 })

const MAX_IMAGES = max

const handleFilesSelected = (files: File[]) => addFiles(files)

const handleFileRejected = (info: { file: File; reason: string }) => {
  message.warning(info.reason)
}

// 计算属性：是否能发帖
const canSubmitPost = computed(() => {
  return (
    (messageContent.value.trim() || count.value > 0) &&
    userStore.isAuthenticated &&
    !postInteractionStore.isCreatingPost()
  )
})

// 发帖方法
const handlePosting = async () => {
  if (!messageContent.value.trim() && selectedImages.value.length === 0) {
    message.warning('发帖内容不能为空')
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
        mediaData = await handleFileUpload(files)
      } catch (error: any) {
        message.error(error.message || '图片上传失败')
        throw error
      }
    }

    // 创建帖子
    await postFeedStore.createAndAddPost({
      content: messageContent.value,
      postType: 'standard',
      media: mediaData.length > 0 ? mediaData : undefined,
    })

    message.success('发帖成功！')
    messageContent.value = '' // 清空输入框
    // 释放预览并清空
  } catch (error: any) {
    message.error(error.message || '发帖失败，请稍后再试')
    console.error('发帖失败:', error)
  } finally {
    clearAll()
    isUploading.value = false
  }
}

// 拖曳排序图片
const handleReorderImages = (payload: { from: number; to: number }) => {
  const { from, to } = payload
  const updatedImages = [...selectedImages.value]
  const [movedItem] = updatedImages.splice(from, 1)
  updatedImages.splice(to, 0, movedItem)
  selectedImages.value = updatedImages
}

const handleClose = () => {
  emit('close')
}
</script>
