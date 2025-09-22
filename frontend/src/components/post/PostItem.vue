<template>
  <div
    :class="{ 'dark:border-borderDark border-borderWhite border-b-1': type !== 'parent' }"
    class="flex w-full transition-all hover:cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-transparent"
    @click="handlePostClick(post)"
  >
    <!-- 头像 -->
    <div class="relative">
      <div class="mx-2 mt-2 h-[2.5rem] w-[2.5rem] sm:h-[3rem] sm:w-[3rem]">
        <Avatar
          :src="post.authorInfo.avatarUrl"
          :username="post.authorInfo.username"
          container-class="h-full w-full rounded-full"
        />
      </div>
      <!-- parentPost向下的线程 -->
      <div
        v-if="type === 'parent'"
        class="absolute left-[calc(50%-1.5px)] h-[calc(100%)] rounded-2xl border-[1.5px] border-[#a8b1bb] dark:border-[#333639]"
      ></div>
    </div>
    <!-- 内容 -->
    <div class="mt-2.5 w-full">
      <!-- 名字/用户id/日期 -->
      <div class="flex w-full flex-1 items-center justify-between pr-4 text-[0.9rem]">
        <AuthorAndSettings
          :username="post.authorInfo.username"
          :userDisplayName="post.authorInfo.displayName"
          :createdAt="post.createdAt"
          :postId="post._id"
          type="default"
          :iconSize="20"
        />
      </div>
      <!-- 文本 -->
      <div class="font-Rounded mr-4 text-[1rem]">
        <span class="tracking-tight break-all whitespace-pre-wrap">{{ post.content }}</span>
      </div>
      <!-- 图片/视频/媒体 -->
      <PostImage :post="post" class="mt-3" />
      <!-- 互动按钮 -->
      <div class="mt-2 mr-4 mb-4 text-[#71767b]">
        <PostAction
          :post="post"
          variant="full"
          @like="handlePostLike"
          @bookmark="handlePostBookmark"
          @retweet="handlePostRetweet"
          @quote="handlePostQuote"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

import AuthorAndSettings from './AuthorAndSettings.vue'
import PostImage from './PostImage.vue'

import Avatar from '@/components/post/Avatar.vue'
import PostAction from '@/components/post/PostAction.vue'
import { useMessage } from '@/composables/useMessage'
import { usePostInteractionStore } from '@/stores'
import { type Post } from '@/types'

const router = useRouter()
const postInteractionStore = usePostInteractionStore()
const message = useMessage()

const props = defineProps<{
  post: Post
  type: 'post' | 'reply' | 'parent'
}>()

// 点赞
const handlePostLike = async () => {
  try {
    await postInteractionStore.toggleLike(props.post._id)
  } catch (error: any) {
    message.error(error.message || '点赞失败')
    console.error(error.message || error)
  }
}
// 收藏
const handlePostBookmark = async () => {
  try {
    await postInteractionStore.toggleBookmark(props.post._id)
  } catch (error: any) {
    message.error(error.message || '收藏失败')
    console.error(error.message || error)
  }
}
// 转发
const handlePostRetweet = async () => {
  try {
    await postInteractionStore.handleRetweet(props.post._id)
  } catch (error: any) {
    message.error(error.message || '转推失败')
    console.error(error)
  }
}
// 引用
const handlePostQuote = async () => {
  message.info('引用功能正在开发中，敬请期待！')
}

// 点击帖子进入详情页
const handlePostClick = (post: Post) => {
  postInteractionStore.viewPost(post._id)
  router.push({
    name: 'PostDetail',
    params: { postId: post._id },
  })
}
</script>

<style scoped></style>
