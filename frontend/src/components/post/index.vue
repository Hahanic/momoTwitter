<template>
  <div v-for="post in postList" :key="post.src" class="w-full flex hover:cursor-pointer border-b-1 dark:border-borderDark dark:hover:bg-transparent hover:bg-[#f7f7f7] transition-all border-borderWhite">
    <!-- 头像 -->
    <div>
      <div class=" h-[3rem] w-[3rem] mx-2 mt-2">
        <img class="rounded-full select-none" src="/myAvatar.jpg"/>
      </div>
    </div>
    <!-- 内容 -->
    <div class="w-full  text-[0.9rem]">
      <!-- 名字/用户id/日期 -->
      <div class="mt-2.5 flex">
        <span class="font-semibold hover:underline">闭金星hina</span>
        <div style="color: #71767b;">
          <span class="ml-1">@jasttenet</span>
          <span class="mx-1">·</span>
          <span>7月21日</span>
        </div>
      </div>
      <!-- 文本 -->
      <div class="mr-4">
        <span>{{ post.message }}</span>
      </div>
      <!-- 图片/视频 -->
      <div class="w-full flex justify-center">
        <div class="max-h-[32rem] my-4 mr-2 rounded-xl">
          <img class="h-full max-w-full rounded-xl" :src="post.src"/>
        </div>
      </div>
      <!-- 点赞 -->
      <div class="mb-4 mr-4 text-[#71767b]">
        <div class="flex justify-between flex-wrap sm:gap-3 gap-2">
          <button type="button" class="flex hover:cursor-pointer items-center"><MessageCircle :color="'#71767b'" :size="24"/><span class="pl-1">{{ post.commentCounts }}</span></button>
          <button type="button" class="flex hover:cursor-pointer items-center"><Repeat2 :color="'#71767b'" :size="24"/><span class="pl-1">{{ post.retweetCounts }}</span></button>
          <button type="button" class="flex hover:cursor-pointer items-center"><HeartIcon :color="'#71767b'" :size="24"/><span class="pl-1">{{ post.likeCounts }}</span></button>
          <button type="button" class="flex hover:cursor-pointer items-center"><ChartNoAxesColumnIcon :color="'#71767b'" :size="24"/><span class="pl-1">{{ post.engagementCounts }}</span></button>
          <div class="flex hover:cursor-pointer justify-center items-center gap-3">
            <button type="button" class="flex hover:cursor-pointer items-center"><Bookmark :color="'#71767b'" :size="24"/></button>
            <button type="button" class="flex hover:cursor-pointer items-center"><Share :color="'#71767b'" :size="24"/></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import { MessageCircle, Repeat2, HeartIcon, ChartNoAxesColumnIcon, Bookmark, Share } from 'lucide-vue-next';

interface Post {
    message?: string,
    src?: string,
    commentCounts: number,
    retweetCounts: number,
    likeCounts: number,
    engagementCounts: number,
}

const postList: Post[] = [
  {
    message: '小镜好可爱😊',
    src: '/kagami1.jpg',
    commentCounts: 4230,
    retweetCounts: 1870,
    likeCounts: 7936,
    engagementCounts: 18093,
  },
  {
    message: 'mili官网的动图',
    src: '/mili.gif',
    commentCounts: 43,
    retweetCounts: 87,
    likeCounts: 936,
    engagementCounts: 87,
  },
  {
    message: '传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物传颂之物',
    src: '/露露缇耶.png',
    commentCounts: 423,
    retweetCounts: 187,
    likeCounts: 7936,
    engagementCounts: 187,
  },
  {
    message: '真红',
    src: '/cuteshinku.webm.gif',
    commentCounts: 423,
    retweetCounts: 187,
    likeCounts: 7936,
    engagementCounts: 187,
  },
]
</script>

<style scoped>

</style>