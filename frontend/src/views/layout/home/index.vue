<template>
  <MainContainer>
    <!-- 移动端显示头像和图标 -->
    <header
      v-if="windowStore.isMobile"
      ref="headerRef"
      class="main-header dark:border-borderDark border-borderWhite sticky top-0 left-0 z-21 h-[3.2rem] w-full border-b-1 bg-white will-change-transform dark:bg-black"
    >
      <div class="relative flex h-full w-full items-center justify-center">
        <div @click="handleMobileMenuOpen" class="absolute left-0 flex h-full items-center justify-center p-4">
          <img
            :src="userStore.user?.avatarUrl || '/cat.svg'"
            :alt="userStore.user?.displayName"
            class="h-6 w-6 rounded-full object-cover"
          />
        </div>
        <div @click="scrollToTop">
          <img class="h-[2.5rem]" src="/warp.svg" />
        </div>
      </div>
    </header>
    <!-- tab -->
    <div
      ref="tabsRef"
      class="tab-bar dark:border-borderDark border-borderWhite sticky left-0 z-20 h-[3.2rem] w-full border-b-1 bg-white/80 backdrop-blur-lg will-change-transform dark:bg-black/80 dark:backdrop-blur-sm"
      :class="windowStore.isMobile ? 'top-[3.2rem]' : 'top-0'"
    >
      <!-- 常态标签 -->
      <div class="flex h-full w-full">
        <div
          class="transition-color flex h-full w-[50%] cursor-pointer items-center justify-center hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/90"
          @dblclick="refreshPosts"
        >
          {{ t('home.forYou') }}
        </div>
        <div
          class="transition-color flex h-full w-[50%] cursor-pointer items-center justify-center hover:bg-[#e7e7e8]/70 dark:hover:bg-[#181818]/80"
        >
          {{ t('home.following') }}
        </div>
      </div>
    </div>
    <div class="w-full">
      <PostCreate v-if="!windowStore.isMobile" />
      <!-- posts -->
      <Posts v-for="post in feedStore.posts" :post="post" :type="'post'" :key="post._id" />
      <div ref="observerEl" class="my-20 flex w-full items-center justify-center">
        <LoaderIcon v-if="feedStore.isLoading" :class="{ 'animate-spin': feedStore.isLoading }" :size="26" />
        <div v-else-if="!canLoadMore && feedStore.posts.length > 0" class="text-sm text-gray-500">
          {{ t('home.noMoreContent') }}
        </div>
      </div>
    </div>
  </MainContainer>

  <StickyAside>
    <SearchInput />
    <!-- 搜索框 -->
    <!-- 推送 -->
    <div class="flex w-full flex-col gap-4 pt-4">
      <AsideContent>
        <div class="p-4">
          <div class="font-bold">{{ t('premium.title') }}</div>
          <div class="mt-2">{{ t('premium.description') }}</div>
          <button class="mt-2 h-[2.5rem] w-fit min-w-[5rem] rounded-4xl bg-blue-400 px-2 font-bold">
            {{ t('premium.button') }}
          </button>
        </div>
      </AsideContent>
      <AsideContent>
        <div class="p-4">
          <div class="mb-4 font-bold">{{ t('explore.news.title') }}</div>
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
  </StickyAside>
</template>

<script setup lang="ts">
import { LoaderIcon } from 'lucide-vue-next'
import { ref, computed, onActivated, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

import AsideContent from '@/components/layout/AsideContent.vue'
import RankItem from '@/components/layout/RankItem.vue'
import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import Posts from '@/components/post/PostItem.vue'
import PostCreate from '@/components/post/PostCreate.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { usePostFeedStore, useUserStore, useWindowStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const feedStore = usePostFeedStore()
const userStore = useUserStore()
const windowStore = useWindowStore()
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
  rootMargin: '0px 0px 500px 0px',
  debounceMs: 300,
})

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// DOM 元素的引用
const headerRef = ref<HTMLElement | null>(null)
const tabsRef = ref<HTMLElement | null>(null)

// 尺寸变量
let headerHeight = 0
let tabsHeight = 0

// 分别记录 Header 和 Tabs 当前被隐藏的距离
let hiddenHeaderHeight = 0
let hiddenTabsHeight = 0

watchEffect(() => {
  if (!windowStore.isMobile || !headerRef.value || !tabsRef.value) {
    return
  }
  const delta = windowStore.scrollDelta
  const scrollY = windowStore.scrollY

  if (scrollY <= 0) {
    hiddenHeaderHeight = 0
    hiddenTabsHeight = 0
  } else {
    const potentialTabsHeight = hiddenTabsHeight + delta
    const clampedTabsHeight = Math.max(0, Math.min(tabsHeight, potentialTabsHeight))
    const consumedDelta = clampedTabsHeight - hiddenTabsHeight

    hiddenTabsHeight = clampedTabsHeight

    const potentialHeaderHeight = hiddenHeaderHeight + delta - consumedDelta
    hiddenHeaderHeight = Math.max(0, Math.min(headerHeight, potentialHeaderHeight))
  }

  if (headerRef.value && tabsRef.value) {
    headerRef.value.style.transform = `translateY(-${hiddenHeaderHeight}px)`

    const tabsTranslateY = -hiddenHeaderHeight - hiddenTabsHeight
    tabsRef.value.style.transform = `translateY(${tabsTranslateY}px)`
  }
})

onActivated(async () => {
  // 设置元素高度和滚动监听器
  if (headerRef.value && tabsRef.value) {
    headerHeight = headerRef.value.offsetHeight
    tabsHeight = tabsRef.value.offsetHeight
  }

  // 首次加载帖子
  if (feedStore.posts.length === 0) {
    await loadInitialPosts()
  }
})

const handleMobileMenuOpen = async () => {
  router.push({ path: route.path, query: { ...route.query, modal: 'mobileMenu' } })
}
</script>
