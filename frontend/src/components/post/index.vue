<template>
  <div
    v-for="post in postLists"
    class="dark:border-borderDark border-borderWhite flex w-full border-b-1 transition-all hover:cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-transparent"
    >
    <!-- :key="post.src" -->
    <!-- 头像 -->
    <div>
      <div class="mx-2 mt-2 h-[3rem] w-[3rem]">
        <img class="rounded-full select-none" src="/myAvatar.jpg" />
      </div>
    </div>
    <!-- 内容 -->
    <div class="w-full text-[0.9rem]">
      <!-- 名字/用户id/日期 -->
      <div class="mt-2.5 flex">
        <span class="font-semibold hover:underline">闭金星hina</span>
        <div style="color: #71767b">
          <span class="ml-1">@jasttenet</span>
          <span class="mx-1">·</span>
          <span>7月21日</span>
        </div>
      </div>
      <!-- 文本 -->
      <div class="mr-4">
        <n-scrollbar style="max-height: 400px;">
          <span class="whitespace-pre-wrap break-all">{{ post.content }}</span>
        </n-scrollbar>
      </div>
      <!-- 图片/视频 -->
      <!-- <div class="flex w-full justify-center">
        <div class="my-4 mr-2 max-h-[32rem] rounded-xl">
          <img class="h-full max-w-full rounded-xl" :src="post.src" />
        </div>
      </div> -->
      <!-- 点赞 -->
      <div class="mr-4 mb-4 mt-2 text-[#71767b]">
        <div class="flex flex-wrap justify-between gap-2 sm:gap-3">
          <button type="button" class="flex items-center hover:cursor-pointer">
            <MessageCircle :color="'#71767b'" :size="24" /><span class="pl-1">{{ post.stats.repliesCount }}</span>
          </button>
          <button type="button" class="flex items-center hover:cursor-pointer">
            <Repeat2 :color="'#71767b'" :size="24" /><span class="pl-1">{{ post.stats.quotesCount }}</span>
          </button>
          <button type="button" class="flex items-center hover:cursor-pointer">
            <HeartIcon :color="'#71767b'" :size="24" /><span class="pl-1">{{ post.stats.likesCount }}</span>
          </button>
          <button type="button" class="flex items-center hover:cursor-pointer">
            <ChartNoAxesColumnIcon :color="'#71767b'" :size="24" /><span class="pl-1">{{ post.stats.viewsCount }}</span>
          </button>
          <div class="flex items-center justify-center gap-3 hover:cursor-pointer">
            <button type="button" class="flex items-center hover:cursor-pointer">
              <Bookmark :color="'#71767b'" :size="24" />
            </button>
            <button type="button" class="flex items-center hover:cursor-pointer">
              <Share :color="'#71767b'" :size="24" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NScrollbar } from 'naive-ui'
import { MessageCircle, Repeat2, HeartIcon, ChartNoAxesColumnIcon, Bookmark, Share } from 'lucide-vue-next'
import { type RecievePostPayload } from '@/types'

const props = defineProps<{
  postLists: RecievePostPayload[]
}>()

console.log(props.postLists)

// interface Post {
//   message?: string
//   src?: string
//   commentCounts: number
//   retweetCounts: number
//   likeCounts: number
//   engagementCounts: number
// }

// const postLists: Post[] = [
//   {
//     message: 'mili官网的动图',
//     src: '/mili.gif',
//     commentCounts: 43,
//     retweetCounts: 87,
//     likeCounts: 936,
//     engagementCounts: 87,
//   },
//   {
//     message: '小镜可爱😊',
//     src: '/kagami1.jpg',
//     commentCounts: 4230,
//     retweetCounts: 1870,
//     likeCounts: 7936,
//     engagementCounts: 18093,
//   },
//   {
//     message: '传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物',
//     src: '/露露缇耶.png',
//     commentCounts: 423,
//     retweetCounts: 187,
//     likeCounts: 7936,
//     engagementCounts: 187,
//   },
//   {
//     message: '真红',
//     src: '/cuteshinku.webm.gif',
//     commentCounts: 423,
//     retweetCounts: 187,
//     likeCounts: 7936,
//     engagementCounts: 187,
//   },
// ]
</script>

<style scoped></style>
