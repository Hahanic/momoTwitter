<template>
  <BaseFormModal>
    <template #header>
      <div class="flex h-full w-full items-center justify-between px-2">
        <button @click="handleClose" class="cursor-pointer rounded-full p-1 transition-colors hover:bg-blue-500/30">
          <X />
        </button>
        <div class="pr-1">
          <p class="cursor-pointer text-blue-400">{{ t('post.draft') }}</p>
        </div>
      </div>
    </template>
    <template #content="{ mobileScrollHeight }">
      <PostEditor
        ref="PostEditorRef"
        local-storage-key="messsageContent"
        v-model="messageContent"
        :scrollbarClass="`sm:min-h-[200px] sm:max-h-[500px]`"
        :maxHeight="windowStore.isMobile ? `calc(100dvh - ${mobileScrollHeight}px - 4rem)` : undefined"
        :placeholder="t('post.whatsHappening')"
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
      <div class="flex h-[3.5rem] justify-between px-1 py-2 sm:px-5">
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
            class="absolute bottom-full z-10 mb-2"
            @emoji-selected="handleEmojiSelected"
          />
        </div>
        <SubmitButton :disabled="!canSubmit" @click="handlePosting" :text="t('post.submit')" />
      </div>
    </template>
  </BaseFormModal>
</template>
<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { X } from 'lucide-vue-next'
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseFormModal from './BaseFormModal.vue'

import EmojiPicker from '@/components/post/EmojiPicker.vue'
import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import PostImagePre from '@/components/post/PostImagePre.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { usePostHandler } from '@/composables/usePostHandler'
import { usePostInteractionStore, usePostFeedStore, useWindowStore } from '@/stores'

const emit = defineEmits(['close'])

const { t } = useI18n()
const postInteractionStore = usePostInteractionStore()
const postFeedStore = usePostFeedStore()
const windowStore = useWindowStore()

// 表情选择器相关状态
const PostEditorRef = ref<InstanceType<typeof PostEditor> | null>(null)
const showEmojiPicker = ref(false)
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

const handleEmojiSelected = (emoji: any) => {
  PostEditorRef.value?.insertEmoji(emoji.unicode)
}

// 点击外部关闭表情选择器
onClickOutside(emojiWrapperRef, () => {
  showEmojiPicker.value = false
})

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
