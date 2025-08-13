<template>
  <main class="dark:border-borderDark border-borderWhite w-[100vw] border-x-1 sm:min-h-screen sm:w-[38rem]">
    <div
      class="dark:border-borderDark border-borderWhite sticky top-0 z-10 grid h-[3.2rem] w-full grid-cols-2 border-b-1 bg-[#ffffff]/80 backdrop-blur-lg dark:bg-[#000]/80 dark:backdrop-blur-sm"
    >
      <div class="flex items-center">
        <button
          @click="router.back()"
          class="ml-4 rounded-full p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft :size="20" />
        </button>
        <span class="ml-4 text-xl font-bold">推文</span>
      </div>
    </div>

    <div class="w-full">
      <!-- 主帖子 -->
      <div v-if="currentPost" class="dark:border-borderDark border-borderWhite border-b p-4">
        <div class="flex">
          <!-- 头像 -->
          <div class="mr-3">
            <img class="max-h-12 max-w-12 rounded-full" :src="currentPost.authorInfo.avatarUrl || '/myAvatar.jpg'" />
          </div>
          <!-- 内容 -->
          <div class="flex-1">
            <!-- 作者信息 -->
            <div class="mb-2 flex flex-wrap items-center">
              <span class="font-bold">{{ currentPost.authorInfo.displayName }}</span>
              <span class="ml-2 text-gray-500">@{{ currentPost.authorInfo.username }}</span>
              <span class="mx-1 text-gray-500">·</span>
              <span class="text-gray-500">{{ formatDate(currentPost.createdAt) }}</span>
            </div>
            <!-- 帖子内容 -->
            <div class="mb-2 text-lg">
              <span class="break-all whitespace-pre-wrap">{{ currentPost.content }}</span>
            </div>
            <!-- 统计信息 -->
            <div class="dark:border-borderDark border-borderWhite border-y py-3 text-gray-500">
              <PostAction :post="currentPost" variant="full" @like="replyStore.likeCurrentPost" />
            </div>
          </div>
        </div>
      </div>

      <!-- 用户发送回复 -->
      <PostReply />

      <!-- 回复列表 -->
      <div v-if="replies.length > 0">
        <div
          v-for="reply in replies"
          :key="reply._id"
          class="dark:border-borderDark border-borderWhite border-b p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50"
        >
          <div class="flex">
            <!-- 头像 -->
            <div class="mr-3">
              <img
                class="max-h-[3rem] max-w-[3rem] rounded-full"
                :src="reply.authorInfo.avatarUrl || '/myAvatar.jpg'"
              />
            </div>
            <!-- 内容 -->
            <div class="flex-1">
              <!-- 作者信息 -->
              <div class="mb-1 flex flex-wrap items-center">
                <span class="font-semibold">{{ reply.authorInfo.displayName }}</span>
                <span class="ml-2 text-sm text-gray-500">@{{ reply.authorInfo.username }}</span>
                <span class="mx-1 text-gray-500">·</span>
                <span class="text-sm text-gray-500">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <!-- 回复内容 -->
              <div class="mb-2">
                <span class="break-all whitespace-pre-wrap">{{ reply.content }}</span>
              </div>
              <!-- 回复操作 -->
              <div class="text-sm text-gray-500">
                <PostAction :post="reply" variant="compact" @like="replyStore.likeReply(reply._id)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多回复 -->
      <div v-if="isLoadingReplies" class="flex h-20 w-full items-center justify-center">
        <span>加载中...</span>
      </div>

      <!-- 加载更多回复按钮 -->
      <div v-else-if="hasMoreReplies && replies.length > 0" class="flex h-20 w-full items-center justify-center">
        <button @click="loadMoreReplies" class="px-4 py-2 font-medium text-blue-500 hover:text-blue-600">
          加载更多回复
        </button>
      </div>

      <!-- 没有更多回复 -->
      <div v-else-if="!hasMoreReplies && replies.length > 0" class="flex h-20 w-full items-center justify-center">
        <span>没有更多回复了</span>
      </div>

      <!-- 没有回复 -->
      <div v-else-if="!isLoadingReplies && replies.length === 0" class="flex h-20 w-full items-center justify-center">
        <span>暂无回复</span>
      </div>
    </div>
  </main>

  <aside class="sticky top-0 ml-7 hidden h-screen w-[15rem] transition-all md:block lg:w-[25rem]">
    <!-- 搜索框 -->
    <div class="z-10 flex h-[3.2rem] items-center">
      <div class="dark:border-borderDark relative flex w-full items-center rounded-2xl">
        <SearchIcon :size="17.6" class="absolute left-3" />
        <input
          type="text"
          placeholder="搜索"
          class="h-[2.4rem] w-full rounded-2xl bg-[#f5f5f5] pr-4 pl-9 text-amber-950 outline-none focus:ring-1 focus:ring-blue-300 dark:bg-[#181818] dark:text-white"
        />
      </div>
    </div>
    <!-- 推送 -->
    <n-scrollbar :trigger="'hover'" style="max-height: 90vh">
      <div class="mt-[0.8rem] flex w-full flex-col gap-[1.2rem]">
        <div class="dark:border-borderDark border-borderWhite h-[9rem] rounded-xl border-1"></div>
        <div class="dark:border-borderDark border-borderWhite h-[35rem] rounded-xl border-1"></div>
      </div>
    </n-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { SearchIcon, ArrowLeft } from 'lucide-vue-next'
import { NScrollbar } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PostAction from '@/components/postAction/index.vue'
import PostReply from '@/components/postReply/index.vue'
import useReplyStore from '@/stores/reply'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()
const replyStore = useReplyStore()

const { currentPost, replies, isLoadingReplies, hasMoreReplies } = storeToRefs(replyStore)

const postId = route.params.postId as string

// 加载更多回复
const loadMoreReplies = async () => {
  await replyStore.loadReplies(postId)
}

// 组件挂载时加载原帖子数据
onMounted(() => {
  replyStore.loadPostDetail(postId)
})
</script>
