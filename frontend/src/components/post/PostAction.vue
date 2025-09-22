<template>
  <div class="postActionContainer flex flex-wrap justify-between gap-2 sm:gap-3">
    <button type="button" class="flex items-center hover:cursor-pointer">
      <MessageCircle :color="'#71767b'" :size="iconSize" /><span v-if="showStatsText" class="pl-1">{{
        props.post.stats.repliesCount
      }}</span>
    </button>
    <button @click.stop="showRetweetMenu" type="button" class="relative flex items-center hover:cursor-pointer">
      <Repeat2 :color="props.post.currentUserInteraction?.isRetweeted ? '#f91880' : '#71767b'" :size="iconSize" /><span
        v-if="showStatsText"
        class="pl-1"
        >{{ props.post.stats.quotesCount + props.post.stats.retweetsCount }}</span
      >
      <Transition name="menu-fade">
        <div
          ref="retweetMenuRef"
          v-if="isShowRetweetMenu"
          class="absolute top-0 right-0 z-2 rounded-md border-1 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black"
        >
          <div class="flex flex-col" @click.stop="isShowRetweetMenu = false">
            <button
              @click="$emit('retweet')"
              class="flex items-center space-x-1 rounded-md px-3 py-2 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
            >
              <Repeat2 :size="20" />
              <span class="text-nowrap">转贴</span>
            </button>
            <button
              @click="$emit('quote')"
              class="flex items-center space-x-1 rounded-md px-3 py-2 text-start text-black transition-[background-color] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-900"
            >
              <PencilLine :size="20" />
              <span class="text-nowrap">引用</span>
            </button>
          </div>
        </div>
      </Transition>
    </button>
    <button @click.stop="emit('like')" type="button" class="flex items-center hover:cursor-pointer">
      <Heart
        :size="iconSize"
        :class="{ 'text-[#f91880]': props.post.currentUserInteraction?.isLiked }"
        :fill="props.post.currentUserInteraction?.isLiked ? '#f91880' : 'none'"
      /><span v-if="showStatsText" class="pl-1">{{ props.post.stats.likesCount }}</span>
    </button>
    <!-- postDetail不显示热度 -->
    <button v-if="type !== 'detail'" type="button" class="flex items-center hover:cursor-pointer">
      <ChartNoAxesColumn :color="'#71767b'" :size="iconSize" /><span class="pl-1">{{
        props.post.stats.viewsCount
      }}</span>
    </button>

    <div v-if="type !== 'detail'" class="flex items-center justify-center gap-3">
      <button
        @click.stop="emit('bookmark')"
        v-if="!windowStore.isMobile"
        type="button"
        class="flex items-center hover:cursor-pointer"
      >
        <Bookmark
          :class="{ 'text-[#f91880]': props.post.currentUserInteraction?.isBookmarked }"
          :fill="props.post.currentUserInteraction?.isBookmarked ? '#f91880' : 'none'"
          :size="iconSize"
        />
      </button>
      <button type="button" class="flex items-center hover:cursor-pointer">
        <Share :color="'#71767b'" :size="iconSize" />
      </button>
    </div>

    <template v-else>
      <button
        @click.stop="emit('bookmark')"
        v-if="!windowStore.isMobile || type === 'detail'"
        type="button"
        class="flex items-center hover:cursor-pointer"
      >
        <Bookmark
          :class="{ 'text-[#f91880]': props.post.currentUserInteraction?.isBookmarked }"
          :fill="props.post.currentUserInteraction?.isBookmarked ? '#f91880' : 'none'"
          :size="iconSize"
        />
      </button>
      <button type="button" class="flex items-center hover:cursor-pointer">
        <Share :color="'#71767b'" :size="iconSize" />
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { MessageCircle, Repeat2, Heart, Bookmark, Share, ChartNoAxesColumn, PencilLine } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import { useWindowStore } from '@/stores'
import { type PostStats } from '@/types'

const windowStore = useWindowStore()

// 组件接收的props
interface PostData {
  _id: string
  stats: PostStats
  currentUserInteraction?: {
    isLiked: boolean
    isBookmarked: boolean
    isRetweeted: boolean
  }
}

const props = withDefaults(
  defineProps<{
    post: PostData
    type?: 'feed' | 'reply' | 'parent' | 'detail'
    iconSize?: number
  }>(),
  {
    iconSize: 19,
  }
)

// 组件发出的事件
const emit = defineEmits(['like', 'bookmark', 'retweet', 'quote'])

// 转贴菜单
const showRetweetMenu = () => {
  isShowRetweetMenu.value = true
}
const retweetMenuRef = ref<HTMLElement | null>(null)
const isShowRetweetMenu = ref(false)
onClickOutside(retweetMenuRef, () => {
  isShowRetweetMenu.value = false
})

// 移动端postDetail不显示文字
const showStatsText = computed((): boolean => {
  return !(windowStore.isMobile && props.type === 'detail')
})
</script>

<style scoped></style>
