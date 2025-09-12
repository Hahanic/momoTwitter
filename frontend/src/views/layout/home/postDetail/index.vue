<template>
  <div class="flex w-full">
    <MainContainer>
      <StickyHead>
        <div class="flex h-[3.2rem] items-center">
          <button
            @click="router.back()"
            class="ml-4 rounded-full p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft :size="20" />
          </button>
          <span class="ml-4 text-xl font-bold">推文</span>
        </div>
      </StickyHead>

      <PostDetail />
    </MainContainer>

    <StickyAside>
      <!-- 搜索框 -->
      <SearchInput />
      <!-- 推送 -->
      <Scrollbar max-height="90vh">
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
      </Scrollbar>
    </StickyAside>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import Scrollbar from '@/components/common/Scrollbar.vue'
import AsideContent from '@/components/layout/AsideContent.vue'
import RankItem from '@/components/layout/RankItem.vue'
import MainContainer from '@/components/layout/ScrollContainer.vue'
import StickyAside from '@/components/layout/StickyAside.vue'
import StickyHead from '@/components/layout/StickyHead.vue'
import PostDetail from '@/components/post/PostDetail.vue'
import SearchInput from '@/components/ui/SearchInput.vue'

const router = useRouter()
</script>
<style scoped></style>
