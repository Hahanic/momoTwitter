<template>
  <div class="flex flex-col">
    <div v-for="post in userPostStore.replies" :key="post._id">
      <div v-if="parentChains[post._id] && parentChains[post._id].length">
        <div v-for="parent in parentChains[post._id]" :key="parent._id">
          <PostComponent type="parent" :post="parent" />
        </div>
      </div>
      <PostComponent type="post" :post="post" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import PostComponent from '@/components/post/index.vue'
import { useUserPostStore, useUserStore, usePostDetailStore } from '@/stores'
import { type Post } from '@/types'

const userPostStore = useUserPostStore()
const postDetailStore = usePostDetailStore()
const userStore = useUserStore()
const route = useRoute()

// 存储每个回复的父帖子链
const parentChains = ref<Record<string, Post[]>>({})

// 为回复加载父帖子链
async function loadParentChains() {
  const replies = userPostStore.replies
  for (const reply of replies) {
    try {
      const { posts } = await postDetailStore.getParentPosts(reply._id)
      posts.pop() // 去掉回复本身
      parentChains.value[reply._id] = posts
    } catch (error) {
      console.error('加载父帖子链失败:', error)
      parentChains.value[reply._id] = []
    }
  }
}

onMounted(async () => {
  const username = route.params.username as string
  // 进入新的user页面，可能fetchUser还没完成，又或者还沿用上次的用户，所以用url params
  if (username !== userStore.currentUserProfile?.username) {
    await userPostStore.loadCategory('replies', username)
  } else if (!userPostStore.replies.length) {
    await userPostStore.loadCategory('replies', userStore.currentUserProfile?.username)
  }
  // 加载父帖子链
  await loadParentChains()
})
</script>
