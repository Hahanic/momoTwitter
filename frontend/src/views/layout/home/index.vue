<template>
  <MainContainer>
    <StickyHead>
      <div class="flex w-full">
        <div
          class="flex h-[3.2rem] w-[50%] cursor-pointer items-center justify-center transition-all hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/90"
          @dblclick="refreshPosts"
        >
          {{ t('home.forYou') }}
        </div>
        <div
          class="flex h-[3.2rem] w-[50%] cursor-pointer items-center justify-center transition-all hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/80"
        >
          {{ t('home.following') }}
        </div>
      </div>
    </StickyHead>

    <div class="w-full">
      <PostCreate />
      <!-- posts -->
      <Posts v-for="post in feedStore.posts" :post="post" :type="'post'" :key="post._id" />
      <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
        <LoaderIcon v-if="feedStore.isLoading" :class="{ 'animate-spin': feedStore.isLoading }" :size="26" />
        <div v-else-if="!canLoadMore && feedStore.posts.length > 0" class="text-sm text-gray-500">没有更多内容了</div>
      </div>
    </div>
  </MainContainer>

  <StickyAside>
    <!-- 搜索框 -->
    <SearchInput />
    <!-- 推送 -->
    <Scrollbar max-height="calc(100% - 3.2rem)">
      <div class="flex w-full flex-col gap-4 pt-4">
        <AsideContent>
          <div class="p-4">
            <div class="font-bold">订阅Premium</div>
            <div class="mt-2">订阅以解锁新功能，若符合条件，还可获得收入分成。</div>
            <button class="mt-2 h-[2.5rem] w-[5rem] rounded-4xl bg-blue-400 font-bold">订阅</button>
          </div>
        </AsideContent>
        <AsideContent>
          <div class="p-4">
            <div class="mb-4 font-bold">有什么新鲜事</div>
            <ul class="flex flex-col gap-4">
              <RankItem />
              <RankItem />
              <RankItem />
              <RankItem />
              <RankItem />
            </ul>
          </div>
        </AsideContent>
      </div>
    </Scrollbar>
  </StickyAside>
</template>

<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Scrollbar from '@/components/common/Scrollbar.vue'
import AsideContent from '@/components/layout/AsideContent.vue'
import RankItem from '@/components/layout/RankItem.vue'
import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
import Posts from '@/components/post/index.vue'
import PostCreate from '@/components/post/PostCreate.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { usePostFeedStore } from '@/stores'

const feedStore = usePostFeedStore()
const { t } = useI18n()

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

const scrollContainer = ref(null)

// 使用无限滚动组合式函数
const { targetEl: observerEl, canLoadMore } = useInfiniteScroll({
  loadMore: loadMorePosts,
  isLoading: computed(() => feedStore.isLoading),
  hasMore: computed(() => feedStore.hasMore),
  scrollContainerRef: scrollContainer,
  rootMargin: '0px 0px 200px 0px',
  debounceMs: 300,
})

onMounted(async () => {
  // 首次加载
  if (feedStore.posts.length === 0) {
    await loadInitialPosts()
  }
})
</script>
