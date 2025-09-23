<template>
  <MainContainer>
    <StickyHead>
      <!-- 搜索及设置 -->
      <div class="flex w-full items-center justify-center pt-2">
        <div class="w-full px-5">
          <SearchInput :searchQuery="searchQuery" @search="onSearch" />
        </div>
        <div class="relative">
          <SettingsIcon :size="20" class="mx-4" />
        </div>
      </div>

      <!-- 标签 -->
      <div class="flex h-[3rem] w-full">
        <RouterLink
          v-for="item in tagList"
          :to="`/explore/${item.path}`"
          class="relative flex h-full w-full items-center justify-center text-[#71767b] transition-[background-color] hover:cursor-pointer hover:dark:bg-[#181818]"
        >
          <span class="text-[0.9rem]">{{ t(item.nameKey) }}</span>
          <div class="active-underline absolute bottom-0 hidden w-[60%] rounded-2xl border-2 border-[#1d9bf0]"></div>
        </RouterLink>
      </div>
    </StickyHead>

    <div class="w-full">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :searchQuery="searchQuery" :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </MainContainer>

  <StickyAside>
    <div class="dark:border-borderDark border-borderWhite mt-4 border-t-1"></div>
    <!-- 推送 -->
    <div class="mt-[0.8rem] flex w-full flex-col gap-[1.2rem]">
      <div class="dark:border-borderDark border-borderWhite h-[9rem] rounded-xl border-1"></div>
      <div class="dark:border-borderDark border-borderWhite h-[35rem] rounded-xl border-1"></div>
    </div>
  </StickyAside>
</template>

<script setup lang="ts">
import { SettingsIcon } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
import SearchInput from '@/components/ui/SearchInput.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const searchQuery = ref<string>('')
// 监听路由参数变化，自动同步搜索框内容
watch(
  () => route.query.q,
  (q) => {
    searchQuery.value = (q as string) || ''
  },
  { immediate: true }
)

const tagList = ref([
  { nameKey: 'explore.tags.for_you', path: 'for_you' },
  { nameKey: 'explore.tags.posts', path: 'posts' },
  { nameKey: 'explore.tags.users', path: 'users' },
])

const onSearch = (q: string, type: string) => {
  if (q.trim()) {
    router.push({ path: `/explore/${type}`, query: { q } })
  }
}
</script>

<style scoped>
.router-link-active {
  font-weight: 600;
  color: black;
}
.dark .router-link-active {
  color: white;
}
/* 让激活链接下的下划线显示出来 */
.router-link-active .active-underline {
  display: block;
}
</style>
