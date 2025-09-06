<template>
  <div class="dark:border-borderDark border-borderWhite w-full border-b-1">
    <!-- 编辑器区域 -->
    <PostEditor ref="PostEditorRef" v-model="messageContent" :placeholder="t('post.whatsHappening')" />

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
        <div ref="emojiWrapperRef" class="relative">
          <MediaToolbar
            @files-selected="handleFilesSelected"
            @file-rejected="handleFileRejected"
            @emoji="handleToggleEmoji"
            :current-count="selectedImages.length"
            :max-count="MAX_IMAGES"
          />
          <EmojiPicker
            v-if="showEmojiPicker"
            class="absolute z-5"
            :style="pickerStyle"
            @emoji-selected="onEmojiSelected"
          />
        </div>
        <div>
          <SubmitButton :disabled="!canSubmit" @click="handlePosting" :text="t('post.submit')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import EmojiPicker from './EmojiPicker.vue'
import PostImagePre from './PostImagePre.vue'

import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { useEmojiPicker } from '@/composables/useEmojiPicker'
import { usePostHandler } from '@/composables/usePostHandler'
import { usePostFeedStore, usePostInteractionStore } from '@/stores'

const postFeedStore = usePostFeedStore()
const postInteractionStore = usePostInteractionStore()
const { t } = useI18n()

const PostEditorRef = ref<InstanceType<typeof PostEditor> | null>(null)
const pickerStyle = ref<Record<string, string>>()

// 使用表情选择器 composable
const { showEmojiPicker, emojiWrapperRef, handleToggleEmoji, handleEmojiSelected } = useEmojiPicker()

// 处理表情选择的包装函数
const onEmojiSelected = (emoji: any) => {
  handleEmojiSelected(emoji, PostEditorRef.value)
}

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
