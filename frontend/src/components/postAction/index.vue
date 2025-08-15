<template>
  <div class="postActionContainer flex flex-wrap justify-between gap-2 sm:gap-3">
    <button type="button" class="flex items-center hover:cursor-pointer">
      <MessageCircle :color="'#71767b'" :size="iconSize" /><span v-if="showStatsText" class="pl-1">{{
        props.post.stats.repliesCount
      }}</span>
    </button>
    <button type="button" class="flex items-center hover:cursor-pointer">
      <Repeat2 :color="'#71767b'" :size="iconSize" /><span v-if="showStatsText" class="pl-1">{{
        props.post.stats.quotesCount
      }}</span>
    </button>
    <button @click.stop="emit('like')" type="button" class="flex items-center hover:cursor-pointer">
      <HeartIcon
        :size="iconSize"
        :class="{ 'text-[#f91880]': props.post.currentUserInteraction?.isLiked }"
        :fill="props.post.currentUserInteraction?.isLiked ? '#f91880' : 'none'"
      /><span v-if="showStatsText" class="pl-1">{{ props.post.stats.likesCount }}</span>
    </button>
    <!-- postDetail不显示热度 -->
    <button v-if="type !== 'detail'" type="button" class="flex items-center hover:cursor-pointer">
      <ChartNoAxesColumnIcon :color="'#71767b'" :size="iconSize" /><span class="pl-1">{{
        props.post.stats.viewsCount
      }}</span>
    </button>

    <div v-if="type !== 'detail'" class="flex items-center justify-center gap-3">
      <button v-if="!windowStore.isMobile" type="button" class="flex items-center hover:cursor-pointer">
        <Bookmark :color="'#71767b'" :size="iconSize" />
      </button>
      <button type="button" class="flex items-center hover:cursor-pointer">
        <Share :color="'#71767b'" :size="iconSize" />
      </button>
    </div>

    <template v-else>
      <button
        v-if="!windowStore.isMobile || type === 'detail'"
        type="button"
        class="flex items-center hover:cursor-pointer"
      >
        <Bookmark :color="'#71767b'" :size="iconSize" />
      </button>
      <button type="button" class="flex items-center hover:cursor-pointer">
        <Share :color="'#71767b'" :size="iconSize" />
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { MessageCircle, Repeat2, Heart as HeartIcon, Bookmark, Share, ChartNoAxesColumnIcon } from 'lucide-vue-next'
import { computed } from 'vue'

import { useWindowStore } from '@/stores'

const windowStore = useWindowStore()

// 组件接收的props
interface PostData {
  _id: string
  stats: {
    repliesCount: number
    quotesCount: number
    likesCount: number
    viewsCount: number
  }
  currentUserInteraction?: {
    isLiked?: boolean
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
const emit = defineEmits(['like'])

// 移动端postDetail不显示文字
const showStatsText = computed((): boolean => {
  return !(windowStore.isMobile && props.type === 'detail')
})
</script>

<style scoped></style>
