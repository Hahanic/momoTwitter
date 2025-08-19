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
      <div v-if="parentPosts.length > 0">
        <div v-for="(parent, _index) in parentPosts" :key="parent._id">
          <Post :post="parent" :type="'parent'" />
        </div>
      </div>

      <!-- 主帖子 -->
      <div v-if="currentPost" ref="currentPostRef" style="scroll-margin-top: 3.7rem" class="mt-2 px-2">
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
            <!-- 图片/视频/媒体 -->
            <PostImage :post="currentPost" />
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
      <!-- <div class="mt-[0.8rem] flex w-full flex-col gap-[1.2rem]">
        <div class="dark:border-borderDark border-borderWhite h-[9rem] rounded-xl border-1"></div>
        <div class="dark:border-borderDark border-borderWhite h-[35rem] rounded-xl border-1"></div>
      </div> -->
      <div class="flex w-full flex-col gap-4 pt-4">
        <AsideContent>
          <div class="p-4">
            <div class="font-bold">订阅Premium</div>
            <div class="mt-2">订阅以解锁新功能，若符合条件，还可获得收入分成。</div>
            <button class="mt-2 h-[2.5rem] w-[5rem] rounded-4xl bg-blue-400 font-bold">订阅</button>
          </div>
        </AsideContent>
        <AsideContent>
          <div class="p-4">
            <div class="mb-4 font-bold">有什么新鲜事</div>
            <ul class="flex flex-col gap-4">
              <RankItem />
              <RankItem />
              <RankItem />
              <RankItem />
              <RankItem />
            </ul>
          </div>
        </AsideContent>
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

import AsideContent from '@/components/layout/AsideContent.vue'
import RankItem from '@/components/layout/RankItem.vue'
import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
import Avatar from '@/components/post/Avatar.vue'
import Post from '@/components/post/index.vue'
import PostAction from '@/components/post/PostAction.vue'
import PostImage from '@/components/post/PostImage.vue'
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

// 监听路由变化，加载帖子详情
watch(
  () => route.params.postId,
  async (newPostId, oldPostId) => {
    // 若 param 未变化（某些情况下触发，比如刷新响应式）则直接返回
    if (newPostId === oldPostId) return

    // 旧帖子的滚动
    if (oldPostId && typeof oldPostId === 'string') {
      const scrollbarDom = document.querySelector('.n-scrollbar-container') as HTMLElement | null
      if (scrollbarDom) {
        windowStore.setPostDetailScroll(oldPostId, scrollbarDom.scrollTop)
      }
    }

    if (newPostId && typeof newPostId === 'string') {
      // 这是等待父帖子链和回复列表全都加载完成 //不包括图片的获取时间
      await detailStore.loadPostDetail(newPostId)

      await nextTick()

      // 只有回退才恢复滚动位置
      if (windowStore.isBackNavigation) {
        const savedScroll = windowStore.getPostDetailScroll(newPostId)
        if (savedScroll > 0) {
          const scrollbarDom = document.querySelector('.n-scrollbar-container') as HTMLElement | null
          if (scrollbarDom) {
            scrollbarDom.scrollTo({ top: savedScroll, behavior: 'auto' })
            windowStore.setBackNavigation(false) // 重置
            return
          }
        }
      }

      if (currentPostRef.value) {
        currentPostRef.value.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        })
      }

      windowStore.setBackNavigation(false)
    }
  },
  { immediate: true }
)
</script>
