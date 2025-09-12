<template>
  <div class="flex h-full w-full">
    <div class="h-full flex-1">
      <div class="h-full w-full">
        <div class="grid h-full w-full grid-cols-1 grid-rows-[4rem_1fr_4rem] bg-black/90">
          <div class="flex items-center justify-between px-3 text-white">
            <button @click="$emit('close')" class="rounded-full p-2 transition-colors hover:bg-gray-800">
              <X :size="24" />
            </button>
            <button
              @click="() => (showPostDetail = !showPostDetail)"
              class="hidden rounded-full p-2 transition-colors hover:bg-gray-800 sm:block"
            >
              <ChevronsRight v-if="showPostDetail" :size="24" />
              <ChevronsLeft v-else :size="24" />
            </button>
          </div>
          <div class="min-h-0">
            <div class="h-full w-full">
              <img
                v-if="post && post.media && post.media.length > 0"
                :src="post.media[currentImageIndex].url"
                alt="Image Preview"
                class="h-full w-full object-contain"
              />
            </div>
          </div>
          <div class="flex items-center justify-between px-3 text-white">
            <div
              class="flex h-full w-full items-center justify-between px-3"
              v-if="post && post.media && post.media.length > 1"
            >
              <button @click="nextImage(-1)" class=":hover:bg-gray-800 rounded-full p-2 transition-colors">
                <ArrowLeft :size="24" />
              </button>
              <button @click="nextImage(1)" class="rounded-full p-2 transition-colors hover:bg-gray-800">
                <ArrowRight :size="24" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="showPostDetail" class="hidden h-full w-[20rem] bg-white/80 sm:block xl:w-[25rem] dark:bg-black/90">
      <Scrollbar>
        <PostDetail v-if="postId" :key="postId" :postId="postId" />
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, X, ChevronsRight, ChevronsLeft } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Scrollbar from '../common/Scrollbar.vue'

import PostDetail from '@/components/post/PostDetail.vue'
import { usePostCacheStore } from '@/stores'
import type { Post } from '@/types'

defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const post = ref<Post | null>(null)
const postId = computed(() => (typeof route.query.postId === 'string' ? route.query.postId : null))
const postCacheStore = usePostCacheStore()
const currentImageIndex = computed(() =>
  typeof route.query.imageIndex === 'string' ? parseInt(route.query.imageIndex, 10) : 0
)
const showPostDetail = ref<boolean>(true)

const loadPostData = async (id: string) => {
  const cachedPost = await postCacheStore.fetchPostIfNotExists(id)
  if (cachedPost) {
    post.value = cachedPost
  }
}

const nextImage = (direction: number) => {
  if (!post.value || !post.value.media || post.value.media.length === 0) return
  let newIndex = currentImageIndex.value + direction
  if (newIndex < 0) newIndex = post.value.media.length - 1
  if (newIndex >= post.value.media.length) newIndex = 0
  const query = { ...route.query, imageIndex: newIndex.toString() }
  router.replace({ query })
}

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
