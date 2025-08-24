<template>
  <div class="dark:border-borderDark border-borderWhite w-full border-b-1">
    <!-- 编辑器区域 -->
    <PostEditor v-model="messageContent" local-storage-key="messsageContent" placeholder="有什么新鲜事?" />

    <!-- 已选择图片预览区 -->
    <PostImagePre :images="selectedImages" @remove-image="removeImage" @reorder-images="handleReorderImages" />

    <!-- 底部工具栏 -->
    <div class="flex min-h-[3rem] px-4 sm:pr-[1rem] sm:pl-[3.8rem]">
      <div class="dark:border-borderDark border-borderWhite flex w-full items-center justify-between border-t-1">
        <MediaToolbar
          @files-selected="handleFilesSelected"
          @file-rejected="handleFileRejected"
          :current-count="selectedImages.length"
          :max-count="MAX_IMAGES"
        />
        <div>
          <SubmitButton
            :disabled="!canSubmitPost || postInteractionStore.isCreatingPost() || isUploading"
            @click="handlePosting"
            text="发帖"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { ref, computed } from 'vue'

import PostImagePre from './PostImagePre.vue'

import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { useImageSelection } from '@/composables/useImageSelection'
import { uploadImages } from '@/composables/useMediaUpload'
import { usePostFeedStore, usePostInteractionStore } from '@/stores'
import useUserStore from '@/stores/userUserStore'

const message = useMessage()
const postFeedStore = usePostFeedStore()
const postInteractionStore = usePostInteractionStore()
const userStore = useUserStore()

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
        mediaData = await uploadImages(files)
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
</script>

<style scoped></style>
