<template>
  <div class="dark:border-borderDark border-borderWhite w-full border-b-1">
    <!-- 编辑器区域 -->
    <PostEditor
      v-model="messageContent"
      local-storage-key="messsageContent"
      placeholder="有什么新鲜事?"
      ref="editorRef"
    />

    <!-- 底部工具栏 -->
    <div class="flex min-h-[3rem] px-4 sm:pr-[1rem] sm:pl-[3.8rem]">
      <div class="dark:border-borderDark border-borderWhite flex w-full items-center justify-between border-t-1">
        <MediaToolbar @image="handleMediaAction" @emoji="handleMediaAction" />
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

import MediaToolbar from '@/components/post/MediaToolbar.vue'
import PostEditor from '@/components/post/PostEditor.vue'
import SubmitButton from '@/components/post/SubmitButton.vue'
import { usePostFeedStore, usePostInteractionStore } from '@/stores'
import useUserStore from '@/stores/user'

const message = useMessage()
const postFeedStore = usePostFeedStore()
const postInteractionStore = usePostInteractionStore()
const userStore = useUserStore()

const editorRef = ref<InstanceType<typeof PostEditor> | null>(null)
const messageContent = ref<string>('')

// 计算属性：是否能发帖
const canSubmitPost = computed(() => {
  return messageContent.value.trim() && userStore.isAuthenticated && !postInteractionStore.isCreatingPost()
})

// 发帖方法
const handlePosting = async () => {
  if (!messageContent.value.trim()) {
    message.warning('发帖内容不能为空')
    return
  }

  if (!userStore.isAuthenticated) {
    message.warning('请先登录！')
    return
  }

  try {
    await postFeedStore.createAndAddPost({
      content: messageContent.value,
      postType: 'standard',
    })
    message.success('发帖成功！')
    messageContent.value = '' // 清空输入框
  } catch (error: any) {
    const errorMsg = error.message || '发帖失败，请稍后再试'
    message.error(errorMsg)
    console.error('发帖失败:', error)
  }
}

// 媒体工具栏处理方法
const handleMediaAction = () => {
  // TODO: 实现媒体功能
  console.log('媒体功能待实现')
}
</script>

<style scoped></style>
