<template>
  <MainContainer>
    <StickyHead>
      <div class="flex w-full">
        <div
          class="flex h-[3.2rem] w-[50%] cursor-pointer items-center justify-center transition-all hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/90"
          @dblclick="refreshPosts"
        >
          为你推荐
        </div>
        <div
          class="flex h-[3.2rem] w-[50%] cursor-pointer items-center justify-center transition-all hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/80"
        >
          关注
        </div>
      </div>
    </StickyHead>

    <div class="w-full">
      <!-- user -->
      <UserSendCard />
      <!-- posts -->
      <Posts v-for="post in feedStore.posts" :post="post" :type="'post'" :key="post._id" />
      <!-- TODO 这里可以降低CLS -->
      <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
        <LoaderIcon v-if="feedStore.isLoading" :class="{ 'animate-spin': feedStore.isLoading }" :size="26" />
      </div>
    </div>
  </MainContainer>

  <StickyAside>
    <!-- 搜索框 -->
    <SearchInput />
    <!-- 推送 -->
    <n-scrollbar class="hide-scrollbar" style="height: calc(100% - 3.2rem)">
      <div class="flex w-full flex-col gap-[1.2rem]">
        <div class="dark:border-borderDark border-borderWhite h-[10rem] rounded-xl border-1"></div>
        <div class="dark:border-borderDark border-borderWhite h-[30rem] rounded-xl border-1"></div>
      </div>
    </n-scrollbar>
  </StickyAside>
</template>

<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { NScrollbar } from 'naive-ui'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
import Posts from '@/components/post/index.vue'
import UserSendCard from '@/components/postCreate/index.vue'
import SearchInput from '@/components/ui/SearchInput/SearchInput.vue'
import { usePostFeedStore } from '@/stores'

const feedStore = usePostFeedStore()

const loadMorePosts = async () => {
  try {
    await feedStore.loadMorePosts()
  } catch (error: any) {
    console.log(error.message || error)
  }
}

const loadInitialPosts = async () => {
  try {
    await feedStore.loadInitialPosts()
  } catch (error: any) {
    console.log(error.message || error)
  }
}

const refreshPosts = async () => {
  try {
    await feedStore.refreshPosts()
  } catch (error: any) {
    console.log(error.message || error)
  }
}

// 滚动加载帖子
const observerEl = ref<HTMLElement | null>(null)
const scrollRoot = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
onMounted(async () => {
  scrollRoot.value = document.querySelector('.n-scrollbar-container')

  // 首次加载
  if (feedStore.posts.length === 0) {
    await loadInitialPosts()
  }

  // 预加载前几个帖子的详情以优化体验
  setTimeout(() => {
    if (feedStore.posts.length > 0) {
      feedStore.preloadPostDetails(3)
    }
  }, 1000)
})
// 其实放进onMounted也行，不过这样更健壮
watch([scrollRoot, observerEl], ([rootElement, targetElement]) => {
  if (observer) {
    observer.disconnect()
  }
  if (rootElement && targetElement) {
    const options = {
      root: rootElement,
      rootMargin: '0px 0px 0px 0px',
      threshold: 0,
    }
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && feedStore.hasMore && !feedStore.isLoading) {
        console.log('IntersectionObserver 触发 loadMorePosts')
        loadMorePosts()
      }
    }, options)
    observer.observe(targetElement)
  }
})
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>
