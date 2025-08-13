<template>
  <div
    class="dark:border-borderDark border-borderWhite flex w-full border-b-1 transition-all hover:cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-transparent"
    @click="handlePostClick(post)"
  >
    <!-- :key="post.src" -->
    <!-- 头像 -->
    <div @click.stop="() => console.log('头像点击')">
      <div class="mx-2 mt-2 h-[3rem] w-[3rem]">
        <img class="rounded-full select-none" src="/myAvatar.jpg" />
      </div>
    </div>
    <!-- 内容 -->
    <div class="w-full text-[0.9rem]">
      <!-- 名字/用户id/日期 -->
      <div class="mt-2.5 flex">
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
      <div class="mr-4">
        <n-scrollbar style="max-height: 400px">
          <span class="break-all whitespace-pre-wrap">{{ post.content }}</span>
        </n-scrollbar>
      </div>
      <!-- 图片/视频 -->
      <!-- <div class="flex w-full justify-center">
        <div class="my-4 mr-2 max-h-[32rem] rounded-xl">
          <img class="h-full max-w-full rounded-xl" :src="post.src" />
        </div>
      </div> -->
      <div class="mt-2 mr-4 mb-4 text-[#71767b]">
        <PostAction :post="post" variant="full" @like="handlePostLike" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NScrollbar } from 'naive-ui'
import { useRouter } from 'vue-router'

import PostAction from '@/components/postAction/index.vue'
import usePostStore from '@/stores/post'
import useReplyStore from '@/stores/reply'
import { type RecievePostPayload } from '@/types'
import { formatDate } from '@/utils'

const router = useRouter()
const postStore = usePostStore()
const replyStore = useReplyStore()

const props = defineProps<{
  post: RecievePostPayload
  type: 'post' | 'postDetail' | 'reply'
}>()

// 根据不同类型帖子映射不同方法
const actionLikeMap = {
  reply: () => replyStore.likeReply(props.post._id),
  post: () => postStore.likePost(props.post._id),
  postDetail: () => replyStore.likeCurrentPost(),
}
// 根据不同类型帖子映射不同路由跳转
const routeMap = {
  reply: 'PostDetail', // todo
  post: 'PostDetail',
  postDetail: '#', // todo
}

// 处理帖子点击事件
const handlePostClick = (post: RecievePostPayload) => {
  if (routeMap[props.type] === '#') return
  router.push({
    name: routeMap[props.type],
    params: { postId: post._id },
  })
}

// 点赞
const handlePostLike = async () => {
  try {
    await actionLikeMap[props.type]()
  } catch (error: any) {
    console.log(error.message || error)
  }
}
</script>

<style scoped></style>
