<template>
  <div class="dark:border-borderDark border-borderWhite w-full border-b">
    <!-- 输入框区域 -->
    <PostEditor
      ref="PostEditorRef"
      v-model="messageContent"
      :placeholder="t('post.submitReply')"
      :scrollbar-class="'sm:max-h-[230px]'"
      :textarea-class="'h-[2rem] leading-[1.4rem] tracking-[1.2px]'"
      @focus="handleTextareaFocus"
    >
      <template #right-button>
        <SubmitButton v-if="!hasUserFocused" :disabled="true" :text="t('post.reply')" class="mt-1 mr-4" />
      </template>
    </PostEditor>

    <!-- 已选择图片预览（回复） -->
    <PostImagePre
      class="px-4 sm:pl-[3.8rem]"
      :images="selectedImages"
      @remove-image="removeImage"
      @reorder-images="handleReorderImages"
    />

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
        <div ref="emojiWrapperRef" class="relative">
          <MediaToolbar
            :icon-size="20"
            @files-selected="handleFilesSelected"
            @file-rejected="handleFileRejected"
            @emoji="handleToggleEmoji"
            :current-count="selectedImages.length"
            :max-count="MAX_IMAGES"
          />
          <EmojiPicker
            v-if="showEmojiPicker"
            class="absolute top-full z-10 mt-2"
            @emoji-selected="handleEmojiSelected"
          />
        </div>
        <SubmitButton :disabled="!canSubmit" @click="handlePosting" :text="t('post.reply')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { MapPin } from 'lucide-vue-next'
import { inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import EmojiPicker from './EmojiPicker.vue'
import PostImagePre from './PostImagePre.vue'

import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { usePostHandler } from '@/composables/usePostHandler'
import { useWindowStore } from '@/stores'

// 组件自身独有的状态，保留在组件内
const hasUserFocused = ref<boolean>(false)
const handleTextareaFocus = () => {
  hasUserFocused.value = true
}

// 表情选择器相关状态
const PostEditorRef = ref<InstanceType<typeof PostEditor> | null>(null)
const showEmojiPicker = ref(false)
const emojiWrapperRef = ref(null)

const handleToggleEmoji = async () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const handleEmojiSelected = (emoji: any) => {
  PostEditorRef.value?.insertEmoji(emoji.unicode)
}

// 点击外部关闭表情选择器
onClickOutside(emojiWrapperRef, () => {
  showEmojiPicker.value = false
})

// 从父级 PostDetail.vue 注入组合式实例，确保与页面详情状态一致
const injected = inject<any>('postDetail', null)
// 类型与空值处理：正常情况下应总能注入到；若为空则降级为不可用状态
const postDetailStore = injected
const windowStore = useWindowStore()
const { t } = useI18n()

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
  // 1. 传入回复的 action
  submitAction: async ({ content, media }) => {
    await postDetailStore.createAndAddPost({
      content,
      postType: 'reply',
      media,
    })
    // 成功后收起工具栏
    hasUserFocused.value = false
  },
  // 2. 传入回复场景下特有的提交检查条件
  additionalCanSubmitChecks: () => {
    if (!postDetailStore) return false
    // currentPostId/isLoadingReplies 均为 ref，需要取 .value
    return !!(postDetailStore.currentPostId.value && !postDetailStore.isLoadingReplies.value)
  },
})
</script>

<style scoped></style>
