<template>
  <div class="flex h-full w-full">
    <div class="h-full flex-1 border-1"></div>
    <div class="hidden h-full w-[20rem] bg-white/80 sm:block xl:w-[25rem] dark:bg-[transparent]">
      <Scrollbar>
        <PostDetail v-if="postId" :key="postId" :postId="postId" />
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import Scrollbar from '../common/Scrollbar.vue'

import PostDetail from '@/components/post/PostDetail.vue'
import { usePostCacheStore } from '@/stores'
import type { Post } from '@/types'

defineEmits(['close'])

const postCacheStore = usePostCacheStore()
const post = ref<Post | null>(null)

const loadPostData = async (id: string) => {
  const cachedPost = await postCacheStore.fetchPostIfNotExists(id)
  if (cachedPost) {
    post.value = cachedPost
  }
  console.log(post.value)
}

const route = useRoute()

const postId = computed(() => (typeof route.query.postId === 'string' ? route.query.postId : null))

watch(
  () => route.query.postId,
  (newPostId) => {
    if (newPostId && typeof newPostId === 'string') {
      loadPostData(newPostId)
    } else {
      post.value = null
    }
  },
  { immediate: true }
)
</script>
