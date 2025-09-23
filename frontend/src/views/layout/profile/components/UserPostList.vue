<template>
  <div class="flex flex-col">
    <!-- 回复帖子需要特殊处理，显示父帖子链 -->
    <template v-if="category === 'replies'">
      <div v-for="post in replyList" :key="post._id">
        <div v-if="parentChains[post._id] && parentChains[post._id].length">
          <div v-for="parent in parentChains[post._id]" :key="parent._id">
            <Post type="parent" :post="parent" />
          </div>
        </div>
        <Post type="post" :post="post" />
      </div>
    </template>

    <!-- 用户主页 posts 分类：时间线项（含转推） -->
    <template v-else-if="category === 'posts'">
      <Post
        type="post"
        v-for="item in timelineItems"
        :post="item.data"
        :key="`${item.type}-${item.data._id}-${item.timestamp}`"
        :isRetweet="item.type === 'retweet'"
        :retweetedBy="item.retweetedBy"
      />
    </template>

    <!-- 其他分类（likes/bookmarks）列表 -->
    <template v-else>
      <Post type="post" v-for="post in postList" :post="post" :key="post._id" />
    </template>

    <!-- 无限滚动触发器 -->
    <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
      <LoaderIcon v-if="isLoading" :class="{ 'animate-spin': isLoading }" :size="26" />
      <div v-else class="text-sm text-gray-500">
        {{ t('home.noMoreContent') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import Post from '@/components/post/PostItem.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { usePostDetail } from '@/composables/usePostDetail'
import { useUserPostStore, useUserStore } from '@/stores'
import { type Post as PostType, type TimelineItem } from '@/types'

type FeedCategory = 'posts' | 'replies' | 'likes' | 'bookmarks'

interface Props {
  category: FeedCategory
}

const props = defineProps<Props>()

const userPostStore = useUserPostStore()
const userStore = useUserStore()
// 只复用工具方法 getParentPosts
const postDetailUtil = usePostDetail(ref(null))
const route = useRoute()
const { t } = useI18n()

// 存储每个回复的父帖子链（仅回复页面使用）
const parentChains = ref<Record<string, PostType[]>>({})

// 1  post + retweet + quote
const timelineItems = computed<TimelineItem[]>(() => (props.category === 'posts' ? userPostStore.postsTimeline : []))
// 2  reply
const replyList = computed<PostType[]>(() => (props.category === 'replies' ? userPostStore.replies : []))
// 3  likes / bookmarks
const postList = computed(() => {
  switch (props.category) {
    case 'likes':
      return userPostStore.likes
    case 'bookmarks':
      return userPostStore.bookmarks
    default:
      return []
  }
})

// 获取加载状态
const isLoading = computed(() => userPostStore.loadingMap[props.category])
const hasMore = computed(() => userPostStore.hasMoreMap[props.category])

// 加载更多数据
const loadMore = async () => {
  const username = route.params.username as string
  await userPostStore.loadCategory(props.category, username)

  // 如果是回复页面，需要加载父帖子链
  if (props.category === 'replies') {
    await loadParentChains()
  }
}

// 为回复加载父帖子链
const loadParentChains = async () => {
  const replies = userPostStore.replies
  for (const reply of replies) {
    // 如果已经加载过这个回复的父帖子链，跳过
    if (parentChains.value[reply._id]) continue

    try {
      const { posts } = await postDetailUtil.getParentPosts(reply._id)
      posts.pop() // 去掉回复本身
      parentChains.value[reply._id] = posts
    } catch (error) {
      console.error('加载父帖子链失败:', error)
      parentChains.value[reply._id] = []
    }
  }
}

// 滚动容器引用
const scrollContainer = ref(null)

// 使用无限滚动组合式函数
const { targetEl: observerEl } = useInfiniteScroll({
  loadMore,
  isLoading,
  hasMore,
  scrollContainerRef: scrollContainer,
  rootMargin: '0px 0px 200px 0px',
  debounceMs: 300,
})

onMounted(async () => {
  const username = route.params.username as string

  // 首次加载数据
  if (username !== userStore.currentUserProfile?.username) {
    await userPostStore.loadCategory(props.category, username)
  } else {
    const currentLen = props.category === 'posts' ? timelineItems.value.length : postList.value.length
    if (!currentLen) {
      await userPostStore.loadCategory(props.category, userStore.currentUserProfile?.username)
    }
  }

  // 如果是回复页面，加载父帖子链
  if (props.category === 'replies') {
    await loadParentChains()
  }
})
</script>
