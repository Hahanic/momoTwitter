<template>
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
</template>

<script lang="ts" setup>
import { MoreHorizontalIcon } from 'lucide-vue-next'
</script>
