<template>
  <div class="flex flex-col">
    <Post type="post" v-for="post in userPostStore.posts" :post="post" />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import Post from '@/components/post/index.vue'
import { useUserPostStore, useUserStore } from '@/stores'

const userPostStore = useUserPostStore()
const userStore = useUserStore()
const route = useRoute()

onMounted(async () => {
  const username = route.params.username as string
  if (username !== userStore.currentUserProfile?.username) {
    await userPostStore.loadCategory('posts', username)
  } else if (!userPostStore.posts.length) {
    await userPostStore.loadCategory('posts', userStore.currentUserProfile?.username)
  }
})
</script>
