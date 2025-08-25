<template>
  <MainContainer>
    <StickyHead>
      <div v-if="currentUserProfile" class="flex h-[3.2rem] w-full justify-between">
        <!-- 左 -->
        <div class="flex">
          <div class="flex items-center justify-center">
            <button
              @click="router.back()"
              class="mr-2 ml-2 rounded-full p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft :size="20" />
            </button>
          </div>
          <div class="flex flex-col items-start">
            <p class="text-[1.1rem] font-bold">
              {{ currentUserProfile.displayName || route.params.username }}
            </p>
            <p class="text-[0.9rem] text-gray-500">{{ currentUserProfile.stats.postsCount ?? '' }} 帖子</p>
          </div>
        </div>
        <!-- 右 -->
        <div class="flex items-center justify-center">
          <button class="mr-2 rounded-full p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
            <SearchIcon :size="20" />
          </button>
        </div>
      </div>
    </StickyHead>

    <div class="min-h-screen w-full">
      <div v-if="isLoading" class="p-4 text-sm text-gray-500">加载中...</div>
      <div v-else-if="!currentUserProfile" class="p-4 text-sm text-gray-500">暂无数据</div>
      <div v-else-if="currentUserProfile" class="flex flex-col">
        <!-- 顶部banner -->
        <div class="h-40 w-full bg-gray-200 dark:bg-gray-800">
          <img class="h-full w-full object-cover" :src="currentUserProfile.bannerUrl || '/10.gif'" />
        </div>
        <!-- 头像和按钮 -->
        <div class="flex w-full justify-between px-4">
          <div
            class="-mt-15 flex h-30 w-30 items-center justify-center rounded-full border-4 border-white bg-gray-300 dark:border-black dark:bg-gray-700"
          >
            <img
              class="h-full w-full rounded-full object-cover"
              :src="currentUserProfile.avatarUrl || '/myAvatar.jpg'"
            />
          </div>
          <div class="mt-2 flex items-center gap-2">
            <button v-if="!isSelf" class="border-borderDark rounded-full border px-4 py-2 text-sm font-bold">
              {{ isFollowing ? '正在关注' : '关注' }}
            </button>
            <button
              @click="editProfile"
              v-else
              class="border-borderDark rounded-full border px-4 py-2 text-sm font-bold"
            >
              编辑资料
            </button>
          </div>
        </div>
        <!-- 姓名简介数据 -->
        <div class="my-4 flex flex-col px-4">
          <h2 class="text-xl leading-tight font-bold">{{ currentUserProfile.displayName }}</h2>
          <p class="text-sm text-gray-500">@{{ currentUserProfile.username }}</p>
          <!-- 简介bio -->
          <div class="my-2 text-[0.9rem]">{{ currentUserProfile.bio || '这家伙很懒，什么都没有留下。' }}</div>

          <div class="flex flex-wrap gap-4 text-xs text-gray-500">
            <span
              >关注 <b class="text-amber-950 dark:text-white">{{ currentUserProfile.stats.followingCount }}</b></span
            >
            <span
              >粉丝 <b class="text-amber-950 dark:text-white">{{ currentUserProfile.stats.followersCount }}</b></span
            >
          </div>
        </div>
        <!-- 菜单 -->
        <div
          v-if="userStore.currentUserProfile"
          class="dark:border-borderDark border-borderWhite flex h-[3.2rem] w-full border-b-1"
        >
          <RouterLink
            v-for="item in tabList"
            :key="item.routeName"
            :to="{ name: item.routeName, params: { username: userStore.currentUserProfile.username } }"
            class="relative flex h-full w-full items-center justify-center text-[#71767b] transition-[background-color] duration-300 hover:cursor-pointer hover:dark:bg-[#181818]"
            :class="{ 'font-bold text-black dark:text-white': route.name === item.routeName }"
          >
            <span>{{ item.name }}</span>
            <div
              class="absolute bottom-0 w-[30%] rounded-2xl border-2 border-[#1d9bf0]"
              v-show="route.name === item.routeName"
            ></div>
          </RouterLink>
        </div>
        <!-- 内容 -->
        <div class="flex w-full flex-col">
          <router-view v-slot="{ Component }">
            <!-- <keep-alive :include="['ProfilePosts', 'ProfileReplies', 'ProfileLikes', 'ProfileBookmarks']"> -->
            <component :is="Component" />
            <!-- </keep-alive> -->
          </router-view>
        </div>
      </div>
    </div>
  </MainContainer>

  <StickyAside>
    <!-- 搜索框 -->
    <SearchInput />
    <!-- 下方推送 -->
    <n-scrollbar class="hide-scrollbar" style="height: calc(100% - 3.2rem)">
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
    </n-scrollbar>
  </StickyAside>
</template>
<script lang="ts">
export default {
  name: 'Profile',
}
</script>
<script setup lang="ts">
import { ArrowLeft, SearchIcon } from 'lucide-vue-next'
import { NScrollbar } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AsideContent from '@/components/layout/AsideContent.vue'
import RankItem from '@/components/layout/RankItem.vue'
import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { useUserStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const { currentUserProfile, isFollowing, isSelf, isLoading } = storeToRefs(userStore)

const tabList = computed(() => {
  const base = [
    { name: '帖子', routeName: 'ProfilePosts' },
    { name: '回复', routeName: 'ProfileReplies' },
    { name: '喜欢', routeName: 'ProfileLikes' },
  ]
  if (isSelf.value) base.push({ name: '收藏', routeName: 'ProfileBookmarks' })
  return base
})

async function fetchProfile(username?: string) {
  const uname = (username || (route.params.username as string))?.trim()
  if (!uname) return
  try {
    await userStore.fetchUserProfile(uname)
  } catch (e: any) {
    console.error(e.message || '获取用户信息失败')
  }
}

onMounted(async () => {
  if (route.params.username !== userStore.currentUserProfile?.username) {
    await fetchProfile(route.params.username as string)
  }
})

// 打开编辑资料模态框
const editProfile = () => {
  router.push({ path: route.path, query: { ...route.query, modal: 'editProfile' } })
}
</script>
