<template>
  <div :class="containerClass">
    <button type="button" class="flex items-center hover:cursor-pointer">
      <MessageCircle :color="'#71767b'" :size="iconSize" /><span class="pl-1">{{ props.post.stats.repliesCount }}</span>
    </button>
    <button type="button" class="flex items-center hover:cursor-pointer">
      <Repeat2 :color="'#71767b'" :size="iconSize" /><span class="pl-1">{{ props.post.stats.quotesCount }}</span>
    </button>
    <button @click.stop="emit('like')" type="button" class="flex items-center hover:cursor-pointer">
      <HeartIcon
        :color="'#71767b'"
        :size="iconSize"
        :fill="props.post.currentUserInteraction?.isLiked ? 'red' : 'none'"
      /><span class="pl-1">{{ props.post.stats.likesCount }}</span>
    </button>
    <button type="button" class="flex items-center hover:cursor-pointer">
      <ChartNoAxesColumnIcon :color="'#71767b'" :size="iconSize" /><span class="pl-1">{{
        props.post.stats.viewsCount
      }}</span>
    </button>
    <div class="flex items-center justify-center gap-3">
      <button type="button" class="flex items-center hover:cursor-pointer">
        <Bookmark :color="'#71767b'" :size="iconSize" />
      </button>
      <button type="button" class="flex items-center hover:cursor-pointer">
        <Share :color="'#71767b'" :size="iconSize" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MessageCircle, Repeat2, Heart as HeartIcon, Bookmark, Share, ChartNoAxesColumnIcon } from 'lucide-vue-next'

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
    variant: 'compact' | 'full'
  }>(),
  {
    variant: 'full',
  }
)

// 组件发出的事件
const emit = defineEmits(['like'])

// 根据props计算class和size
const iconSize = props.variant === 'compact' ? 18 : 24
const containerClass =
  props.variant === 'compact' ? 'flex flex-wrap gap-x-6 gap-y-2' : 'flex flex-wrap justify-between gap-2 sm:gap-3'
</script>

<style scoped></style>
