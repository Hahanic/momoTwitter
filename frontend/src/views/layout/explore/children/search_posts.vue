<template>
  <div class="h-full w-full">
    <PostItem v-for="post in posts" :key="post._id" :post="post" :type="'post'" />
    <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
      <LoaderIcon v-if="isLoading" :class="{ 'animate-spin': isLoading }" :size="26" />
      <div v-else-if="!canLoadMore" class="text-sm text-gray-500">没有更多内容了</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { searchPosts } from '@/api'
import PostItem from '@/components/post/PostItem.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { usePostCacheStore } from '@/stores'
import { type Post } from '@/types'

const route = useRoute()
const postCacheStore = usePostCacheStore()
const searchQuery = ref<string>('')
const posts = ref<Post[]>([])
// 加载状态
const page = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)
const initialLoad = ref(true)

const scrollContainer = ref(null)

const loadMore = async () => {
  if (!hasMore.value || !searchQuery.value.trim()) return

  isLoading.value = true
  try {
    const response = await searchPosts(searchQuery.value, page.value)
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
    initialLoad.value = false
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

watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string' && newQuery.trim() !== '' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery
      searchPosts(newQuery).then((response) => {
        posts.value = response.posts || []
        window.scrollTo({ top: 0, behavior: 'auto' })
      })
    }
  },
  { immediate: true }
)
</script>
