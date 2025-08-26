<template>
  <div class="flex flex-col">
    <Post type="post" v-for="post in userPostStore.posts" :post="post" />
    <div ref="observerEl" class="h-20 w-full"></div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import Post from '@/components/post/index.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useUserPostStore, useUserStore } from '@/stores'

const userPostStore = useUserPostStore()
const userStore = useUserStore()
const route = useRoute()

// 滚动容器引用
const scrollContainerRef = ref<HTMLElement | null>(null)

// 使用无限滚动组合式函数
const { targetEl: observerEl } = useInfiniteScroll({
  loadMore: () => userPostStore.loadCategory('posts', route.params.username as string),
  isLoading: computed(() => userPostStore.loadingMap.posts),
  hasMore: computed(() => userPostStore.hasMoreMap.posts),
  scrollContainerRef,
  rootMargin: '0px 0px 200px 0px',
  debounceMs: 300,
})

onMounted(async () => {
  // 获取滚动容器
  scrollContainerRef.value = document.querySelector('.n-scrollbar-container')

  // 首次加载
  // 进入新的user页面，可能fetchUser还没完成，又或者还沿用上次的用户，所以用url params
  const username = route.params.username as string
  if (username !== userStore.currentUserProfile?.username) {
    await userPostStore.loadCategory('posts', username)
  } else if (!userPostStore.posts.length) {
    await userPostStore.loadCategory('posts', userStore.currentUserProfile?.username)
  }
})
</script>
