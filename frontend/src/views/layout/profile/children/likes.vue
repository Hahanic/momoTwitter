<template>
  <div class="flex flex-col">
    <Post type="post" v-for="post in userPostStore.likes" :post="post" :key="post._id" />

    <!-- 无限滚动触发器 -->
    <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
      <LoaderIcon
        v-if="userPostStore.loadingMap.likes"
        :class="{ 'animate-spin': userPostStore.loadingMap.likes }"
        :size="26"
      />
      <div v-else-if="!canLoadMore && userPostStore.likes.length > 0" class="text-sm text-gray-500">没有更多内容了</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import Post from '@/components/post/index.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useUserPostStore, useUserStore } from '@/stores'

const userPostStore = useUserPostStore()
const userStore = useUserStore()
const route = useRoute()

// 加载更多点赞
const loadMoreLikes = async () => {
  const username = route.params.username as string
  await userPostStore.loadCategory('likes', username)
}

// 滚动容器引用
const scrollContainerRef = ref<HTMLElement | null>(null)

// 使用无限滚动组合式函数
const { targetEl: observerEl, canLoadMore } = useInfiniteScroll({
  loadMore: loadMoreLikes,
  isLoading: computed(() => userPostStore.loadingMap.likes),
  hasMore: computed(() => userPostStore.hasMoreMap.likes),
  scrollContainerRef,
  rootMargin: '0px 0px 200px 0px',
  debounceMs: 300,
})

onMounted(async () => {
  // 获取滚动容器
  scrollContainerRef.value = document.querySelector('.n-scrollbar-container')

  const username = route.params.username as string
  if (username !== userStore.currentUserProfile?.username) {
    await userPostStore.loadCategory('likes', username)
  } else if (!userPostStore.likes.length) {
    await userPostStore.loadCategory('likes', userStore.currentUserProfile?.username)
  }
})
</script>
