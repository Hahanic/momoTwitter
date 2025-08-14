<template>
  <div
    :class="{ 'dark:border-borderDark border-borderWhite border-b-1': type !== 'parent' }"
    class="shover:bg-[#f7f7f7] flex w-full transition-all hover:cursor-pointer dark:hover:bg-transparent"
    @click="handlePostClick(post)"
  >
    <!-- 头像 -->
    <div class="relative">
      <div @click.stop="() => console.log('头像点击')" class="relative mx-2 mt-2 h-[3rem] w-[3rem]">
        <!-- 边框 -->
        <div
          class="absolute inset-0 rounded-full border-2 border-transparent transition-all hover:border-blue-500"
        ></div>
        <!-- 头像 -->
        <img class="rounded-full select-none" src="/myAvatar.jpg" />
      </div>
      <!-- parentPost向下的线程 -->
      <div
        v-if="type === 'parent'"
        class="absolute left-[2rem] h-[calc(100%-3rem)] rounded-2xl border-[1.5px] border-[#333639]"
      ></div>
    </div>
    <!-- 内容 -->
    <div class="w-full text-[1rem]">
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
import { usePostInteractionStore } from '@/stores'
import { type RecievePostPayload } from '@/types'
import { formatDate } from '@/utils'

const router = useRouter()
const postInteractionStore = usePostInteractionStore()

const props = defineProps<{
  post: RecievePostPayload
  type: 'post' | 'reply' | 'parent'
}>()

// 点赞
const handlePostLike = async () => {
  try {
    await postInteractionStore.toggleLike(props.post._id)
  } catch (error: any) {
    console.log(error.message || error)
  }
}

// 处理帖子点击事件
const handlePostClick = (post: RecievePostPayload) => {
  router.push({
    name: 'PostDetail',
    params: { postId: post._id },
  })
}
</script>

<style scoped></style>
