<template>
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
            :username="currentPost.authorInfo.username"
            :src="currentPost.authorInfo.avatarUrl"
            :alt="currentPost.authorInfo.displayName"
            container-class="sm:h-[3rem] sm:w-[3rem] h-[2.5rem] w-[2.5rem]"
          />
          <AuthorAndSettings
            :username="currentPost.authorInfo.username"
            :userDisplayName="currentPost.authorInfo.displayName"
            :createdAt="currentPost.createdAt"
            :postId="currentPost._id"
            type="detail"
            :iconSize="20"
          />
        </div>
        <div class="mt-2 w-full flex-1">
          <!-- 内容 -->
          <div class="font-Rounded mx-2 text-[1rem]">
            <span class="tracking-tight break-all whitespace-pre-wrap">{{ currentPost.content }}</span>
          </div>
          <div class="mx-2">
            <!-- 翻译按钮 -->
            <button
              v-if="!isTranslating && !displayTranslation"
              @click="handleTranslate"
              class="flex items-start justify-center text-[0.9rem] text-blue-500 hover:underline"
            >
              翻译推文
            </button>
            <div
              v-else-if="translationResult && !isTranslating && displayTranslation"
              class="text-[0.8rem] text-blue-500"
            >
              由deepseek翻译
            </div>

            <div v-if="isTranslating" class="text-[0.9rem] text-gray-500">正在翻译...</div>
            <!-- 翻译结果 -->
            <div v-if="translationResult && displayTranslation" class="font-Rounded text-[1rem]">
              <span class="tracking-tight break-all whitespace-pre-wrap">{{
                translationResult.translatedContent
              }}</span>
            </div>
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
    <div v-else class="flex h-60 w-full items-center justify-center"></div>

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
</template>

<script setup lang="ts">
import { watch, ref, nextTick, computed, provide } from 'vue'
import { useRoute } from 'vue-router'

import AuthorAndSettings from '@/components/post/AuthorAndSettings.vue'
import Avatar from '@/components/post/Avatar.vue'
import PostAction from '@/components/post/PostAction.vue'
import PostImage from '@/components/post/PostImage.vue'
import Post from '@/components/post/PostItem.vue'
import PostReply from '@/components/post/PostReply.vue'
import { useMessage } from '@/composables/useMessage'
import { usePostDetail } from '@/composables/usePostDetail'
import { usePostInteractionStore, useWindowStore } from '@/stores'
import { formatDatePostDetail } from '@/utils'

const route = useRoute()
const interactionStore = usePostInteractionStore()
const windowStore = useWindowStore()
const message = useMessage()

const props = defineProps<{ postId?: string }>()
const effectivePostId = computed(() => props.postId ?? (route.params.postId as string | undefined) ?? null)
const detail = usePostDetail(effectivePostId)
const { currentPost, replies, isLoadingReplies, hasMoreReplies, parentPosts } = detail

// 向子组件（如 PostReply）提供详情实例，避免各自创建互相干扰
provide('postDetail', detail)

// 添加ref用于引用currentPost元素
const currentPostRef = ref<HTMLElement | null>(null)
// 用于跟踪当前显示的 postId，以便在切换时保存滚动位置
const displayingPostId = ref<string | null>(null)
// 当返回时若回复尚未加载完成，第一次恢复可能因为内容高度不足而失败，记录待恢复的目标 scrollTop
const pendingScrollTop = ref<number | null>(null)

// 翻译结果
const translationResult = computed(() => {
  if (!currentPost.value) return null
  return interactionStore.translatedPosts.get(currentPost.value._id)
})

const isTranslating = computed(() => interactionStore.isTranslatingPost(currentPost.value?._id || ''))

const displayTranslation = ref(false)

// 加载更多回复
const loadMoreReplies = async () => {
  try {
    await detail.loadReplies()
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
    message.error(error.message || '点赞失败')
    console.error(error.message || error)
  }
}
// 收藏
const handlePostBookmark = async () => {
  if (!currentPost.value) return

  try {
    await interactionStore.toggleBookmark(currentPost.value._id)
  } catch (error: any) {
    message.error(error.message || '收藏失败')
    console.error(error.message || error)
  }
}
// 翻译
const handleTranslate = async () => {
  if (!currentPost.value) return

  displayTranslation.value = true

  try {
    await interactionStore.handleTranslatePost(currentPost.value._id)
  } catch (error: any) {
    message.error(error.message || '翻译失败')
    console.error(error.message || error)
  }
}

// 监听路由变化，加载帖子详情
watch(
  () => effectivePostId.value,
  async (newPostId, _oldPostId) => {
    console.log('PostDetail.vue: postId changed to', newPostId)
    displayTranslation.value = false

    // 若 param 未变化（某些情况下触发，比如刷新响应式）则直接返回
    if (newPostId === displayingPostId.value || !newPostId) return

    if (newPostId && typeof newPostId === 'string') {
      // 更新正在显示的 postId
      displayingPostId.value = newPostId

      // 加载帖子详情
      await detail.loadPostDetail(newPostId)
      await nextTick()

      // 只有回退才恢复滚动位置（第一阶段：主帖子渲染后立即尝试）
      if (windowStore.isBackNavigation) {
        const savedScroll = windowStore.getPostDetailScroll(newPostId)
        if (savedScroll >= 0) {
          // 当前容器最大可滚动位置（可能此时回复还没加载，高度不足）
          const maxNow = document.documentElement.scrollHeight - window.innerHeight
          // 先滚动一次
          window.scrollTo({ top: savedScroll, behavior: 'auto' })
          // 如果目标位置超过当前最大值（意味着内容还没完全加载），记为待二次恢复
          if (savedScroll > maxNow - 20) {
            pendingScrollTop.value = savedScroll
          } else {
            pendingScrollTop.value = null
            // 已成功恢复则无需默认 scrollIntoView
            windowStore.setBackNavigation(false)
            return
          }
        }
      } else {
        if (currentPostRef.value) {
          currentPostRef.value.scrollIntoView({ behavior: 'auto', block: 'start' })
        }
      }
    }
  },
  { immediate: true }
)

// 第二阶段：等待回复/父链异步内容加载完成后再尝试恢复 pendingScrollTop
watch(
  () => [replies.value.length, isLoadingReplies.value, parentPosts.value.length],
  async () => {
    if (!windowStore.isBackNavigation) return
    if (pendingScrollTop.value == null) return
    if (isLoadingReplies.value) return
    await nextTick()
    window.scrollTo({ top: pendingScrollTop.value, behavior: 'auto' })
  }
)

// 下面的已经不需要了

// 这里是因为从该帖子返回然后再次进入该帖子时确保本帖子在顶部
// 因为PostId，watch没有继续往下执行scrollIntoView
// onActivated(() => {
//   if (windowStore.navType === 'forward') {
//     if (currentPostRef.value) {
//       console.log('onActivated in PostDetail.vue')
//       currentPostRef.value.scrollIntoView({ behavior: 'auto', block: 'start' })
//     }
//   }
// })
// onMounted(() => {
//   console.log('onMounted in PostDetail.vue')
// })
</script>
