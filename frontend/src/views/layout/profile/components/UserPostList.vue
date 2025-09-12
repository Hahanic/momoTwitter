<template>
  <div class="flex flex-col">
    <!-- 回复帖子需要特殊处理，显示父帖子链 -->
    <template v-if="category === 'replies'">
      <div v-for="post in posts" :key="post._id">
        <div v-if="parentChains[post._id] && parentChains[post._id].length">
          <div v-for="parent in parentChains[post._id]" :key="parent._id">
            <Post type="parent" :post="parent" />
          </div>
        </div>
        <Post type="post" :post="post" />
      </div>
    </template>

    <!-- 普通帖子列表 -->
    <template v-else>
      <Post type="post" v-for="post in posts" :post="post" :key="post._id" />
    </template>

    <!-- 无限滚动触发器 -->
    <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
      <LoaderIcon v-if="isLoading" :class="{ 'animate-spin': isLoading }" :size="26" />
      <div v-else-if="!canLoadMore && posts.length > 0" class="text-sm text-gray-500">
        {{ t('home.noMoreContent') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { onMounted, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import Post from '@/components/post/PostItem.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { usePostDetail } from '@/composables/usePostDetail'
import { useUserPostStore, useUserStore } from '@/stores'
import { type Post as PostType } from '@/types'

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

// 根据类别获取对应的帖子列表
const posts = computed(() => {
  switch (props.category) {
    case 'posts':
      return userPostStore.posts
    case 'replies':
      return userPostStore.replies
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
const { targetEl: observerEl, canLoadMore } = useInfiniteScroll({
  loadMore,
  isLoading,
  hasMore,
  scrollContainerRef: scrollContainer,
  rootMargin: '0px 0px 200px 0px',
  debounceMs: 300,
})

// 监听类别变化，重置父帖子链
watch(
  () => props.category,
  () => {
    parentChains.value = {}
  }
)

onMounted(async () => {
  const username = route.params.username as string

  // 首次加载数据
  if (username !== userStore.currentUserProfile?.username) {
    await userPostStore.loadCategory(props.category, username)
  } else if (!posts.value.length) {
    await userPostStore.loadCategory(props.category, userStore.currentUserProfile?.username)
  }

  // 如果是回复页面，加载父帖子链
  if (props.category === 'replies') {
    await loadParentChains()
  }
})
</script>
