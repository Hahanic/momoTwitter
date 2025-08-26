<template>
  <div class="flex flex-col">
    <div v-for="post in userPostStore.replies" :key="post._id">
      <div v-if="parentChains[post._id] && parentChains[post._id].length">
        <div v-for="parent in parentChains[post._id]" :key="parent._id">
          <PostComponent type="parent" :post="parent" />
        </div>
      </div>
      <PostComponent type="post" :post="post" />
    </div>

    <!-- 无限滚动触发器 -->
    <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
      <LoaderIcon
        v-if="userPostStore.loadingMap.replies"
        :class="{ 'animate-spin': userPostStore.loadingMap.replies }"
        :size="26"
      />
      <div v-else-if="!canLoadMore && userPostStore.replies.length > 0" class="text-sm text-gray-500">
        没有更多内容了
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import PostComponent from '@/components/post/index.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useUserPostStore, useUserStore, usePostDetailStore } from '@/stores'
import { type Post } from '@/types'

const userPostStore = useUserPostStore()
const postDetailStore = usePostDetailStore()
const userStore = useUserStore()
const route = useRoute()

// 存储每个回复的父帖子链
const parentChains = ref<Record<string, Post[]>>({})

// 加载更多回复
const loadMoreReplies = async () => {
  const username = route.params.username as string
  await userPostStore.loadCategory('replies', username)
  // 加载新回复的父帖子链
  await loadParentChains()
}

// 为回复加载父帖子链
async function loadParentChains() {
  const replies = userPostStore.replies
  for (const reply of replies) {
    // 如果已经加载过这个回复的父帖子链，跳过
    if (parentChains.value[reply._id]) continue

    try {
      const { posts } = await postDetailStore.getParentPosts(reply._id)
      posts.pop() // 去掉回复本身
      parentChains.value[reply._id] = posts
    } catch (error) {
      console.error('加载父帖子链失败:', error)
      parentChains.value[reply._id] = []
    }
  }
}

// 滚动容器引用
const scrollContainerRef = ref<HTMLElement | null>(null)

// 使用无限滚动组合式函数
const { targetEl: observerEl, canLoadMore } = useInfiniteScroll({
  loadMore: loadMoreReplies,
  isLoading: computed(() => userPostStore.loadingMap.replies),
  hasMore: computed(() => userPostStore.hasMoreMap.replies),
  scrollContainerRef,
  rootMargin: '0px 0px 200px 0px',
  debounceMs: 300,
})

onMounted(async () => {
  // 获取滚动容器
  scrollContainerRef.value = document.querySelector('.n-scrollbar-container')

  const username = route.params.username as string
  if (username !== userStore.currentUserProfile?.username) {
    await userPostStore.loadCategory('replies', username)
  } else if (!userPostStore.replies.length) {
    await userPostStore.loadCategory('replies', userStore.currentUserProfile?.username)
  }
  // 加载父帖子链
  await loadParentChains()
})
</script>
