<template>
  <main class="dark:border-borderDark border-borderWhite w-[100vw] border-x-1 sm:min-h-screen sm:w-[38rem]">
    <div
      class="dark:border-borderDark border-borderWhite sticky top-0 z-10 grid h-[3.2rem] w-full grid-cols-2 border-b-1 bg-[#ffffff]/80 backdrop-blur-lg dark:bg-[#000]/80 dark:backdrop-blur-sm"
    >
      <div
        class="flex cursor-pointer items-center justify-center transition-all hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/90"
      >
        为你推荐
      </div>
      <div
        class="flex cursor-pointer items-center justify-center transition-all hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/80"
      >
        关注
      </div>
    </div>

    <div class="w-full">
      <!-- user -->
      <userSendCard />
      <!-- posts -->
      <posts :postLists="postStore.posts" />
      <div ref="observerEl" class="flex h-20 w-full items-center justify-center">
        <LoaderIcon
          v-if="postStore.hasMore && postStore.isLoading"
          :class="{ 'animate-spin': postStore.isLoading }"
          :size="26"
        />
        <span v-else>没有更多了</span>
      </div>
    </div>
  </main>

  <aside class="sticky top-0 ml-7 hidden h-screen w-[15rem] transition-all md:block lg:w-[25rem]">
    <!-- 搜索框 -->
    <div class="z-10 flex h-[3.2rem] items-center">
      <div class="dark:border-borderDark relative flex w-full items-center rounded-2xl">
        <SearchIcon :size="17.6" class="absolute left-3" />
        <input
          type="text"
          placeholder="搜索"
          class="h-[2.4rem] w-full rounded-2xl bg-[#f5f5f5] pr-4 pl-9 text-amber-950 outline-none focus:ring-1 focus:ring-blue-300 dark:bg-[#181818] dark:text-white"
        />
      </div>
    </div>
    <!-- 推送 -->
    <n-scrollbar :trigger="'hover'" style="max-height: 90vh">
      <div class="mt-[0.8rem] flex w-full flex-col gap-[1.2rem]">
        <div class="dark:border-borderDark border-borderWhite h-[9rem] rounded-xl border-1"></div>
        <div class="dark:border-borderDark border-borderWhite h-[35rem] rounded-xl border-1"></div>
      </div>
    </n-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import userSendCard from '@/components/userSendCard/index.vue'
import posts from '@/components/post/index.vue'
import { NScrollbar } from 'naive-ui'
import { SearchIcon, LoaderIcon } from 'lucide-vue-next'
import usePostStore from '@/stores/post'

const postStore = usePostStore()

const loadMorePosts = async () => {
  try {
    await postStore.fetchMorePosts()
  } catch (error: any) {
    console.log(error.message || error)
  }
}

// 滚动加载帖子
const observerEl = ref<HTMLElement | null>(null)
const scrollRoot = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
onMounted(() => {
  scrollRoot.value = document.querySelector('.n-scrollbar-container')
  // 首次加载
  if (postStore.posts.length === 0) {
    loadMorePosts()
  }
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
      if (entries[0].isIntersecting) {
        console.log('observer')
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
