<template>
  <div class="dark:border-borderDark border-borderWhite w-full border-b-1">
    <!-- 编辑器区域 -->
    <PostEditor v-model="messageContent" local-storage-key="messsageContent" placeholder="有什么新鲜事?" />

    <!-- 已选择图片预览区 -->
    <div v-if="selectedImages.length" class="mt-2 px-4 sm:pl-[3.8rem]">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(img, idx) in selectedImages"
          :key="idx"
          class="group relative h-28 w-28 overflow-hidden rounded-lg border border-dashed border-gray-400 dark:border-gray-600"
        >
          <img :src="img.preview" class="h-full w-full object-cover" @click="openPreview(idx)" />
          <button
            type="button"
            class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
            @click.stop="removeImage(idx)"
            aria-label="移除图片"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

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
            :disabled="!canSubmitPost || postInteractionStore.isCreatingPost()"
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

import { apiUploadImage, apiUploadImages } from '@/api'
import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { useImageSelection } from '@/composables/useImageSelection'
import { usePostFeedStore, usePostInteractionStore } from '@/stores'
import useUserStore from '@/stores/userUserStore'

const message = useMessage()
const postFeedStore = usePostFeedStore()
const postInteractionStore = usePostInteractionStore()
const userStore = useUserStore()

const messageContent = ref<string>('')

const isUploading = ref(false)

// 图片选择与预览（提取为组合式函数）
const { selectedImages, count, max, addFiles, removeImage, clearAll } = useImageSelection({ max: 4 })

const MAX_IMAGES = max

const handleFilesSelected = (files: File[]) => addFiles(files)

const handleFileRejected = (info: { file: File; reason: string }) => {
  message.warning(info.reason)
}

const openPreview = (idx: number) => {
  // 预留：可引入全局预览组件
  console.log('预览图片 index=', idx)
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

    // 如果有图片，先上传图片
    if (selectedImages.value.length > 0) {
      isUploading.value = true

      const imageCount = selectedImages.value.length
      message.info(`正在上传${imageCount}张图片...`)

      // 如果只有一张
      if (imageCount === 1) {
        const formatDate = new FormData()
        formatDate.append('image', selectedImages.value[0].file)
        try {
          const response = await apiUploadImage(formatDate)
          mediaData.push({
            type: 'image',
            url: response.relativePath,
          })
        } catch (error: any) {
          message.error(`图片上传失败: ${error.message}`)
        }
      } else {
        // 批量上传图片
        const formData = new FormData()
        selectedImages.value.forEach((img) => {
          formData.append('images', img.file)
        })
        try {
          console.log(Array.from(formData.values()))
          const response = await apiUploadImages(formData)
          console.log(response)
          mediaData = response.files.map((file) => ({
            type: 'image' as const,
            url: file.relativePath,
          }))
        } catch (error) {
          throw new Error('批量上传失败，请稍后重试')
        }
      }

      message.success(`成功上传 ${mediaData.length} 张图片`)
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
    clearAll()
  } catch (error: any) {
    const errorMsg = error.message || '发帖失败，请稍后再试'
    message.error(errorMsg)
    console.error('发帖失败:', error)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped></style>
