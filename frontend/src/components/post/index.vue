<template>
  <div
    :class="{ 'dark:border-borderDark border-borderWhite border-b-1': type !== 'parent' }"
    class="flex w-full transition-all hover:cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-transparent"
    @click="handlePostClick(post)"
  >
    <!-- 头像 -->
    <div class="relative">
      <div class="mx-2 mt-2 h-[3rem] w-[3rem]">
        <Avatar :src="post.authorInfo.avatarUrl" container-class="h-[3rem] w-[3rem]" @click.stop="handleAvatarClick" />
      </div>
      <!-- parentPost向下的线程 -->
      <div
        v-if="type === 'parent'"
        class="absolute left-[2rem] h-[calc(100%-3rem)] rounded-2xl border-[1.5px] border-[#a8b1bb] dark:border-[#333639]"
      ></div>
    </div>
    <!-- 内容 -->
    <div class="w-full">
      <!-- 名字/用户id/日期 -->
      <div class="mt-2.5 flex text-[0.9rem]">
        <span @click.stop="() => console.log('displayname点击')" class="font-semibold hover:underline">{{
          post.authorInfo.displayName
        }}</span>
        <div style="color: #71767b">
          <span @click.stop="() => console.log('username点击')" class="ml-1">@{{ post.authorInfo.username }}</span>
          <span class="mx-1">·</span>
          <span>{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>
      <!-- 文本 -->
      <div class="mr-4 text-[1rem]">
        <!-- <n-scrollbar style="max-height: 400px"> -->
        <span class="tracking-tight break-all whitespace-pre-wrap">{{ post.content }}</span>
        <!-- </n-scrollbar> -->
      </div>
      <!-- 图片/视频 -->
      <!-- <div class="flex w-full justify-center">
        <div class="my-4 mr-2 max-h-[32rem] rounded-xl">
          <img class="h-full max-w-full rounded-xl" :src="post.src" />
        </div>
      </div> -->
      <div class="mt-2 mr-4 mb-4 text-[#71767b]">
        <PostAction :post="post" variant="full" @like="handlePostLike" @bookmark="handlePostBookmark" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NScrollbar, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'

import Avatar from '@/components/post/Avatar.vue'
import PostAction from '@/components/post/PostAction.vue'
import { usePostInteractionStore } from '@/stores'
import { type RecievePostPayload } from '@/types'
import { formatDate } from '@/utils'

const router = useRouter()
const postInteractionStore = usePostInteractionStore()
const message = useMessage()

const props = defineProps<{
  post: RecievePostPayload
  type: 'post' | 'reply' | 'parent'
}>()

// 头像点击
const handleAvatarClick = () => {
  console.log('头像点击')
}

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

// 处理帖子点击事件
const handlePostClick = (post: RecievePostPayload) => {
  postInteractionStore.viewPost(post._id)
  router.push({
    name: 'PostDetail',
    params: { postId: post._id },
  })
}
</script>

<style scoped></style>
