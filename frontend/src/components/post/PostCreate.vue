<template>
  <div class="dark:border-borderDark border-borderWhite w-full border-b-1">
    <!-- 编辑器区域 -->
    <PostEditor v-model="messageContent" placeholder="有什么新鲜事?" />

    <!-- 已选择图片预览区 -->
    <PostImagePre
      class="px-4 sm:pl-[3.8rem]"
      :images="selectedImages"
      @remove-image="removeImage"
      @reorder-images="handleReorderImages"
    />

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
          <SubmitButton :disabled="!canSubmit" @click="handlePosting" text="发帖" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PostImagePre from './PostImagePre.vue'

import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { usePostHandler } from '@/composables/usePostHandler'
import { usePostFeedStore, usePostInteractionStore } from '@/stores'

const postFeedStore = usePostFeedStore()
const postInteractionStore = usePostInteractionStore()

const {
  messageContent,
  canSubmit,
  handlePosting,
  selectedImages,
  MAX_IMAGES,
  removeImage,
  handleFilesSelected,
  handleFileRejected,
  handleReorderImages,
} = usePostHandler({
  submitAction: async ({ content, media }) => {
    await postFeedStore.createAndAddPost({
      content,
      postType: 'standard',
      media,
    })
  },
  additionalCanSubmitChecks: () => !postInteractionStore.isCreatingPost(),
})
</script>

<style scoped></style>
