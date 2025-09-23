<template>
  <div class="h-full w-full">
    <!-- 如果是 from:username: 格式且没有搜索内容，显示提示 -->
    <div
      v-if="props.searchQuery.match(/^from:[^:]+:$/) && posts.length === 0 && !isLoading"
      class="p-8 text-center text-gray-500"
    >
      <div class="mb-2 text-lg">🔍 搜索该用户的帖子</div>
      <div class="text-sm">
        在上方搜索框中输入关键词来搜索 <strong>{{ props.searchQuery.split(':')[1] }}</strong> 的帖子
      </div>
    </div>

    <PostItem v-for="post in posts" :key="post._id" :post="post" :type="'post'" />
    <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
      <LoaderIcon v-if="isLoading" :class="{ 'animate-spin': isLoading }" :size="26" />
      <div v-else-if="!canLoadMore && posts.length > 0" class="text-sm text-gray-500">没有更多内容了</div>
      <div
        v-else-if="!canLoadMore && posts.length === 0 && props.searchQuery && !props.searchQuery.match(/^from:[^:]+:$/)"
        class="text-sm text-gray-500"
      >
        没有找到相关内容
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { ref, watch } from 'vue'

import { searchPosts } from '@/api'
import PostItem from '@/components/post/PostItem.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { usePostCacheStore } from '@/stores'
import { type Post } from '@/types'

const props = withDefaults(
  defineProps<{
    searchQuery?: string
  }>(),
  {
    searchQuery: '',
  }
)

const postCacheStore = usePostCacheStore()
const posts = ref<Post[]>([])
// 加载状态
const page = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)
const hasInitialLoad = ref(false)

const scrollContainer = ref(null)

const loadMore = async () => {
  if (!hasMore.value || !props.searchQuery.trim() || !hasInitialLoad.value) return

  isLoading.value = true
  try {
    const response = await searchPosts(props.searchQuery, page.value)
    postCacheStore.addPosts(response.posts)
    const existingIds = new Set(posts.value.map((p) => p._id))
    const newPosts = response.posts.filter((p) => !existingIds.has(p._id))
    posts.value.push(...newPosts)
    hasMore.value = response.hasMore
    if (hasMore.value) {
      page.value++
    }
  } catch (error) {
    console.error('加载搜索结果失败:', error)
  } finally {
    isLoading.value = false
  }
}

const { targetEl: observerEl, canLoadMore } = useInfiniteScroll({
  loadMore,
  isLoading,
  hasMore,
  scrollContainerRef: scrollContainer,
  rootMargin: '0px 0px 200px 0px',
  debounceMs: 300,
})

// 1 "from:username:" 格式，且没有搜索内容，不进行搜索
// 2 "from:username:keyword" 格式，搜索用户里含keyword的帖子
// 3 "from:username" 格式，搜索用户的全部帖子
watch(
  () => props.searchQuery,
  (newQuery, oldQuery) => {
    if (typeof newQuery === 'string' && newQuery.trim() !== '' && newQuery !== oldQuery) {
      if (newQuery.match(/^from:[^:]+:$/)) {
        posts.value = []
        return
      }

      // 重置状态
      posts.value = []
      page.value = 1
      hasMore.value = true
      hasInitialLoad.value = false

      isLoading.value = true
      searchPosts(newQuery, 1)
        .then((response) => {
          posts.value = response.posts || []
          postCacheStore.addPosts(response.posts)
          page.value = 2
          isLoading.value = false
          hasMore.value = response.hasMore
          hasInitialLoad.value = true
          window.scrollTo({ top: 0, behavior: 'auto' })
        })
        .catch((error) => {
          console.error('搜索失败:', error)
        })
    }
  },
  { immediate: true }
)
</script>
