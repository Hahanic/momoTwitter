<template>
  <div class="flex w-full flex-col p-4">
    <router-link to="12" class="mb-3">
      <div class="flex items-center justify-between">
        <h1 class="font-semibold">今日博德之门更新八号补丁</h1>
        <button
          @click.prevent="() => console.log('more')"
          class="flex items-center justify-center rounded-full text-[#71767b] transition-all hover:cursor-pointer hover:bg-[#0a171f] hover:text-[#1d9bf0]"
        >
          <MoreHorizontalIcon :size="22" />
        </button>
      </div>
      <p class="text-[#71767b]">Netflixで独占配音。</p>
    </router-link>
    <ul class="flex flex-col gap-3">
      <li>
        <router-link to="12" class="text-[0.9rem]">
          <div class="flex items-center justify-between">
            <p class="text-[#71767b]"><span>1 · </span>全球趋势</p>
            <button
              @click.prevent="() => console.log('more')"
              class="flex items-center justify-center rounded-full text-[#71767b] transition-all hover:cursor-pointer hover:bg-[#0a171f] hover:text-[#1d9bf0]"
            >
              <MoreHorizontalIcon :size="22" />
            </button>
          </div>
          <p class="font-semibold">传颂之物：白之道标 发售日期已定</p>
          <p class="text-[#71767b]">11.7万 条帖子</p>
        </router-link>
      </li>
      <li>
        <router-link to="12" class="text-[0.9rem]">
          <div class="flex items-center justify-between">
            <p class="text-[#71767b]"><span>2 · </span>全球趋势</p>
            <button
              @click.prevent="() => console.log('more')"
              class="flex items-center justify-center rounded-full text-[#71767b] transition-all hover:cursor-pointer hover:bg-[#0a171f] hover:text-[#1d9bf0]"
            >
              <MoreHorizontalIcon :size="22" />
            </button>
          </div>
          <p class="font-semibold">索尼wxm6 体验如何</p>
          <p class="text-[#71767b]">9.3万 条帖子</p>
        </router-link>
      </li>
      <li v-for="i in 10">
        <router-link to="12" class="text-[0.9rem]">
          <div class="flex items-center justify-between">
            <p class="text-[#71767b]"><span>3 · </span>全球趋势</p>
            <button
              @click.prevent="() => console.log('more')"
              class="flex items-center justify-center rounded-full text-[#71767b] transition-all hover:cursor-pointer hover:bg-[#0a171f] hover:text-[#1d9bf0]"
            >
              <MoreHorizontalIcon :size="22" />
            </button>
          </div>
          <p class="font-semibold">茉莉花新饮品开发进展</p>
          <p class="text-[#71767b]">5.4{{ i }}万 条帖子</p>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { MoreHorizontalIcon } from 'lucide-vue-next'
// import { ref } from 'vue'

// interface RankItem {
//   id: number | string // 唯一ID，用于 v-for 的 :key 和路由跳转
//   type: 'featured' | 'trend' // 项目类型，用于区分第一个特殊的和后续的趋势列表
//   rank?: number // 排名，只有 trend 类型的项目有
//   category?: string // 分类，例如 "全球趋势"
//   title: string // 主标题
//   subtitle: string // 副标题或描述，例如帖子数量或简介
//   image?: string | null // (可选) 图片URL，方便未来扩展
// }

// const rankList = ref<RankItem[]>([
//   {
//     id: 101, // 假设的ID
//     type: 'featured', // 第一个作为特别推荐
//     title: '今日博德之门更新八号补丁',
//     subtitle: 'Netflixで独占配音。',
//     image: null,
//   },
//   {
//     id: 202,
//     type: 'trend',
//     rank: 1,
//     category: '全球趋势',
//     title: '传颂之物：白之道标 发售日期已定',
//     subtitle: '11.7万 条帖子',
//     image: null,
//   },
//   {
//     id: 303,
//     type: 'trend',
//     rank: 2,
//     category: '全球趋势',
//     title: '索尼wxm6 体验如何',
//     subtitle: '9.3万 条帖子',
//     image: null,
//   },
//   {
//     id: 404,
//     type: 'trend',
//     rank: 3,
//     category: '茉莉花新饮品开发进展',
//     title: '茉莉花新饮品开发进展',
//     subtitle: '5.4万 条帖子',
//     image: null,
//   },
// ])
</script>
