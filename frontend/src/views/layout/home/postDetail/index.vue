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
              <div class="flex flex-wrap justify-between gap-2 sm:gap-3">
                <button type="button" class="flex items-center hover:cursor-pointer">
                  <MessageCircle :color="'#71767b'" :size="24" /><span class="pl-1">{{
                    currentPost.stats.repliesCount
                  }}</span>
                </button>
                <button type="button" class="flex items-center hover:cursor-pointer">
                  <Repeat2 :color="'#71767b'" :size="24" /><span class="pl-1">{{ currentPost.stats.quotesCount }}</span>
                </button>
                <button type="button" class="flex items-center hover:cursor-pointer">
                  <HeartIcon :color="'#71767b'" :size="24" /><span class="pl-1">{{
                    currentPost.stats.likesCount
                  }}</span>
                </button>
                <button type="button" class="flex items-center hover:cursor-pointer">
                  <ChartNoAxesColumnIcon :color="'#71767b'" :size="24" /><span class="pl-1">{{
                    currentPost.stats.viewsCount
                  }}</span>
                </button>
                <div class="flex items-center justify-center gap-3 hover:cursor-pointer">
                  <button type="button" class="flex items-center hover:cursor-pointer">
                    <Bookmark :color="'#71767b'" :size="24" />
                  </button>
                  <button type="button" class="flex items-center hover:cursor-pointer">
                    <Share :color="'#71767b'" :size="24" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户回复 -->
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
                <div class="flex flex-wrap gap-x-6 gap-y-2">
                  <button type="button" class="flex items-center hover:cursor-pointer">
                    <MessageCircle :color="'#71767b'" :size="18" /><span class="pl-1">{{
                      reply.stats.repliesCount
                    }}</span>
                  </button>
                  <button type="button" class="flex items-center hover:cursor-pointer">
                    <Repeat2 :color="'#71767b'" :size="18" /><span class="pl-1">{{ reply.stats.quotesCount }}</span>
                  </button>
                  <button type="button" class="flex items-center hover:cursor-pointer">
                    <HeartIcon :color="'#71767b'" :size="18" /><span class="pl-1">{{ reply.stats.likesCount }}</span>
                  </button>
                  <button type="button" class="flex items-center hover:cursor-pointer">
                    <Bookmark :color="'#71767b'" :size="18" />
                  </button>
                  <button type="button" class="flex items-center hover:cursor-pointer">
                    <Share :color="'#71767b'" :size="18" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多回复 -->
      <div v-if="isLoadingReplies" class="flex h-20 w-full items-center justify-center">
        <span>加载中...</span>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NScrollbar } from 'naive-ui'
import {
  SearchIcon,
  ArrowLeft,
  MessageCircle,
  Repeat2,
  HeartIcon,
  ChartNoAxesColumnIcon,
  Bookmark,
  Share,
} from 'lucide-vue-next'
import usePostStore from '@/stores/post'
import { type RecievePostPayload } from '@/types'
import { formatDate } from '@/utils'
import PostReply from '@/components/postReply/index.vue'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()

// 当前帖子数据
const currentPost = ref<RecievePostPayload | null>(null)
// 回复列表
const replies = ref<RecievePostPayload[]>([])
// 加载状态
const isLoadingReplies = ref(false)
// 分页游标
const repliesCursor = ref<string | null>(null)
// 是否还有更多回复
const hasMoreReplies = ref(true)

// 获取帖子详情
const loadPostDetail = async () => {
  const postId = route.params.postId as string
  // 首先尝试从store中找到当前帖子
  const foundPost = postStore.posts.find((post) => post._id === postId)
  if (foundPost) {
    currentPost.value = foundPost
  }
  // 加载回复
  await loadReplies(postId)
}

// 加载回复
const loadReplies = async (postId: string) => {
  if (isLoadingReplies.value) return

  try {
    isLoadingReplies.value = true
    const response = await postStore.fetchReplies(postId, repliesCursor.value)
    console.log('loadReplies', response, currentPost.value)
    // 如果没有找到当前帖子，使用返回的parentPost
    if (!currentPost.value && response.parentPost) {
      currentPost.value = response.parentPost
    }
    // 追加回复到列表
    replies.value.push(...response.replies)
    // 更新游标和是否还有更多数据
    repliesCursor.value = response.nextCursor
    hasMoreReplies.value = response.nextCursor !== null
  } catch (error) {
    console.error('加载回复失败:', error)
  } finally {
    isLoadingReplies.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadPostDetail()
})
</script>
