<template>
  <MainContainer>
    <StickyHead>
      <div class="flex h-[3.2rem] items-center">
        <button
          @click="router.back()"
          class="ml-4 rounded-full p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft :size="20" />
        </button>
        <span class="ml-4 text-xl font-bold">推文</span>
      </div>
    </StickyHead>

    <div class="w-full">
      <!-- 父帖子链 -->
      <div v-if="parentPosts.length > 0 && showParentPosts">
        <div v-for="(parent, _index) in parentPosts" :key="parent._id">
          <Post :post="parent" :type="'parent'" />
        </div>
      </div>

      <!-- 主帖子 -->
      <div v-if="currentPost" ref="currentPostRef" style="scroll-margin-top: 3.67rem" class="mt-2 px-2">
        <div class="flex flex-col">
          <!-- 头像和name -->
          <div class="flex gap-2">
            <Avatar
              :src="currentPost.authorInfo.avatarUrl"
              :alt="currentPost.authorInfo.displayName"
              container-class="h-12 w-12"
            />
            <div class="flex w-full flex-1 items-center justify-between text-[0.9rem]">
              <!-- userName -->
              <div class="flex h-full flex-col items-center">
                <span class="font-bold hover:underline">{{ currentPost.authorInfo.displayName }}</span>
                <span class="text-center text-gray-500">@{{ currentPost.authorInfo.username }}</span>
              </div>
              <!-- setting -->
              <div class="flex h-full items-center justify-center text-gray-500">
                <MoreHorizontalIcon :size="20" />
              </div>
            </div>
          </div>
          <div class="flex-1">
            <!-- 内容 -->
            <div class="mx-2 text-[1rem]">
              <span class="tracking-tight break-all whitespace-pre-wrap">{{ currentPost.content }}</span>
            </div>
            <!-- 日期 -->
            <div class="mx-2 mt-2 w-full text-[0.85rem]">
              <span class="text-gray-500">
                {{ formatDatePostDetail(currentPost.createdAt)
                }}<span v-if="currentPost.stats.viewsCount >= 10"
                  ><span class="px-1">&middot;</span
                  ><span class="font-bold text-black dark:text-white">{{ currentPost.stats.viewsCount }}</span
                  >&nbsp;查看</span
                >
              </span>
            </div>
            <!-- 移动设备显示stats而不是在postACtion -->
            <div v-if="windowStore.isMobile" class="h-10 w-full">
              <div class="ml-2 flex h-10 items-center text-[0.95rem] text-white">
                <span class="text-black dark:text-white"
                  >{{ currentPost.stats.quotesCount + currentPost.stats.retweetsCount
                  }}<span class="text-gray-500">&nbsp;转推&nbsp;&nbsp;</span></span
                >
                <span class="text-black dark:text-white"
                  >{{ currentPost.stats.likesCount }}<span class="text-gray-500">&nbsp;喜欢&nbsp;&nbsp;</span></span
                >
                <span class="text-black dark:text-white"
                  >{{ currentPost.stats.bookmarksCount }}<span class="text-gray-500">&nbsp;书签&nbsp;&nbsp;</span></span
                >
              </div>
            </div>
            <!-- 统计信息 -->
            <div class="dark:border-borderDark border-borderWhite mx-2 border-y py-3 text-gray-500">
              <PostAction
                :post="currentPost"
                type="detail"
                @like="handleLikeCurrentPost"
                @bookmark="handlePostBookmark"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 用户发送回复 -->
      <PostReply />

      <!-- 回复列表 -->
      <div v-if="replies.length > 0">
        <Post v-for="reply in replies" :post="reply" :type="'reply'" :key="reply._id" />
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

      <!-- 底部空白空间，确保有足够的滚动空间让currentPost位于顶部 -->
      <div class="h-[calc(100dvh-8rem)]"></div>
    </div>
  </MainContainer>

  <StickyAside>
    <!-- 搜索框 -->
    <SearchInput />
    <!-- 推送 -->
    <n-scrollbar :trigger="'hover'" style="max-height: 90vh">
      <div class="mt-[0.8rem] flex w-full flex-col gap-[1.2rem]">
        <div class="dark:border-borderDark border-borderWhite h-[9rem] rounded-xl border-1"></div>
        <div class="dark:border-borderDark border-borderWhite h-[35rem] rounded-xl border-1"></div>
      </div>
    </n-scrollbar>
  </StickyAside>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { MoreHorizontalIcon } from 'lucide-vue-next'
import { NScrollbar, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { watch, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
import Avatar from '@/components/post/Avatar.vue'
import Post from '@/components/post/index.vue'
import PostAction from '@/components/post/PostAction.vue'
import PostReply from '@/components/post/PostReply.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { usePostDetailStore, usePostInteractionStore, useWindowStore } from '@/stores'
import { formatDatePostDetail } from '@/utils'

const route = useRoute()
const router = useRouter()
const detailStore = usePostDetailStore()
const interactionStore = usePostInteractionStore()
const windowStore = useWindowStore()
const message = useMessage()

// 添加ref用于引用currentPost元素
const currentPostRef = ref<HTMLElement | null>(null)
// 标记是否需要保持currentPost在顶部
const shouldMaintainPosition = ref(false)
// 控制父帖子的显示时机
const showParentPosts = ref(false)

const { currentPost, replies, isLoadingReplies, hasMoreReplies, parentPosts } = storeToRefs(detailStore)

// 加载更多回复
const loadMoreReplies = async () => {
  try {
    await detailStore.loadReplies()
  } catch (error) {
    console.error('加载更多回复失败:', error)
  }
}

// 点赞当前帖子
const handleLikeCurrentPost = async () => {
  if (!currentPost.value) return

  try {
    await interactionStore.toggleLike(currentPost.value._id)
  } catch (error: any) {
    message.error('点赞失败')
    console.error(error.message || error)
  }
}
// 收藏
const handlePostBookmark = async () => {
  if (!currentPost.value) return

  try {
    await interactionStore.toggleBookmark(currentPost.value._id)
  } catch (error: any) {
    message.error('收藏失败')
    console.error(error.message || error)
  }
}

// 滚动到当前帖子的函数
const scrollToCurrentPost = async (behavior: ScrollBehavior = 'smooth') => {
  await nextTick()
  if (currentPostRef.value) {
    currentPostRef.value.scrollIntoView({
      behavior,
      block: 'start',
    })
  }
}

// 保持当前帖子在顶部位置的函数
const maintainCurrentPostPosition = async () => {
  if (shouldMaintainPosition.value && currentPostRef.value) {
    await nextTick()
    // 使用instant行为以避免闪烁
    currentPostRef.value.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    })
  }
}

// 监听路由变化，加载帖子详情
watch(
  () => route.params.postId,
  async (newPostId) => {
    if (newPostId) {
      // 重置状态
      shouldMaintainPosition.value = false
      showParentPosts.value = false

      await detailStore.loadPostDetail(newPostId as string)

      // 等待currentPost渲染完成并进行初始定位
      await nextTick()

      // 确保currentPost已经存在并且可以获取到DOM元素
      if (currentPost.value && currentPostRef.value) {
        // 初始滚动到当前帖子，使用smooth行为
        await scrollToCurrentPost('smooth')

        // 等待滚动完成后再显示父帖子
        setTimeout(async () => {
          if (parentPosts.value.length > 0) {
            showParentPosts.value = true
            // 等待父帖子渲染完成
            await nextTick()
            // 父帖子显示后重新调整位置
            await maintainCurrentPostPosition()
          }
          // 启用持续的位置维护
          shouldMaintainPosition.value = true
        }, 500) // 500ms延迟，确保currentPost滚动和定位完成
      } else {
        // 如果没有currentPost，直接显示父帖子
        showParentPosts.value = true
        shouldMaintainPosition.value = true
      }
    }
  },
  { immediate: true } // 立即执行一次
)

// 监听showParentPosts变化，当父帖子开始显示时调整位置
watch(
  showParentPosts,
  async (shouldShow) => {
    if (shouldShow && currentPost.value && currentPostRef.value) {
      // 父帖子显示时，确保currentPost保持在顶部
      await nextTick()
      await maintainCurrentPostPosition()
    }
  },
  { flush: 'post' } // 在DOM更新后执行
)
</script>
