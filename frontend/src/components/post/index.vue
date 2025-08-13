<template>
  <div
    v-for="post in postLists"
    :key="post._id"
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
      <!-- 点赞 -->
      <div class="mt-2 mr-4 mb-4 text-[#71767b]">
        <PostAction :post="post" variant="full" @like="postStore.likePost(post._id)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { NScrollbar } from 'naive-ui'
import { type RecievePostPayload } from '@/types'
import { formatDate } from '@/utils'
import usePostStore from '@/stores/post'
import PostAction from '@/components/postAction/index.vue'

const router = useRouter()
const postStore = usePostStore()

defineProps<{
  postLists: RecievePostPayload[]
}>()

// 处理帖子点击事件
const handlePostClick = (post: RecievePostPayload) => {
  router.push({
    name: 'PostDetail',
    params: { postId: post._id },
  })
}
</script>

<style scoped></style>
