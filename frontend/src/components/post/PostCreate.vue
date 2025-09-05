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
            @emoji-selected="handleEmojiSelected"
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
import { onClickOutside } from '@vueuse/core'
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import EmojiPicker from './EmojiPicker.vue'
import PostImagePre from './PostImagePre.vue'

import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { usePostHandler } from '@/composables/usePostHandler'
import { usePostFeedStore, usePostInteractionStore } from '@/stores'

const postFeedStore = usePostFeedStore()
const postInteractionStore = usePostInteractionStore()
const { t } = useI18n()

const PostEditorRef = ref<InstanceType<typeof PostEditor> | null>(null)
const showEmojiPicker = ref(false)
const pickerStyle = ref<Record<string, string>>()
const emojiWrapperRef = ref(null)

const handleToggleEmoji = async (Event: MouseEvent) => {
  showEmojiPicker.value = !showEmojiPicker.value
  if (showEmojiPicker.value) {
    await nextTick()
    const button = Event?.currentTarget as HTMLElement
    if (button) {
      // const rect = button.getBoundingClientRect()
      // pickerStyle.value = {
      //   top: `${rect.bottom + window.scrollY + 8}px`,
      //   left: `${rect.left + window.scrollX}px`,
      // }
    }
  }
}

// 6. 选择了表情后的处理逻辑（核心连接点）
const handleEmojiSelected = (emoji: any) => {
  // 调用 PostEditor 暴露出的 insertText 方法
  console.log(emoji)
  PostEditorRef.value?.insertEmoji(emoji.unicode)
  // 选择后关闭选择器
  // showEmojiPicker.value = false
}
// 7. 点击外部关闭
onClickOutside(emojiWrapperRef, () => {
  showEmojiPicker.value = false
})

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
