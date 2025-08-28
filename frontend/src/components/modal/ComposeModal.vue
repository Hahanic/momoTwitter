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
        :scrollbarClass="'min-h-[50px] sm:max-h-[60dvh] max-h-[50dvh]'"
      >
      </PostEditor>
    </template>
    <template #footer>
      <PostImagePre
        class="px-2 sm:px-5"
        :images="selectedImages"
        @remove-image="removeImage"
        @reorder-images="handleReorderImages"
      />
      <div class="flex justify-between px-1 py-2 sm:px-5">
        <MediaToolbar
          @files-selected="handleFilesSelected"
          @file-rejected="handleFileRejected"
          :current-count="selectedImages.length"
          :max-count="MAX_IMAGES"
        />
        <SubmitButton :disabled="!canSubmit" @click="handlePosting" text="发帖" />
      </div>
    </template>
  </FormModal>
</template>
<script setup lang="ts">
import { X } from 'lucide-vue-next'

import MediaToolbar from '../post/MediaToolbar.vue'
import PostEditor from '../post/PostEditor.vue'
import PostImagePre from '../post/PostImagePre.vue'
import SubmitButton from '../post/SubmitButton.vue'

import FormModal from './FormModal.vue'

import { usePostHandler } from '@/composables/usePostHandler'
import { usePostInteractionStore, usePostFeedStore } from '@/stores'

const emit = defineEmits(['close'])

// 只需要引入这两个 store 来定义提交逻辑
const postInteractionStore = usePostInteractionStore()
const postFeedStore = usePostFeedStore()

// 调用 Composable，并传入特定的发帖逻辑和检查条件
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
  // 1. 传入发帖的 action
  submitAction: async ({ content, media }) => {
    await postFeedStore.createAndAddPost({
      content,
      postType: 'standard',
      media,
    })
    // 成功后可以执行特定于此组件的操作
    emit('close')
  },
  // 2. 传入该组件特有的提交检查条件
  additionalCanSubmitChecks: () => !postInteractionStore.isCreatingPost(),
})

const handleClose = () => {
  emit('close')
}
</script>
