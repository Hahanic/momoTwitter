<template>
  <div>
    <button @click="handleFollowToggle" class="border-borderDark rounded-full border px-4 py-2 text-sm font-bold">
      {{ buttonText }}
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

import { useMessage } from '@/composables/useMessage'
import { useUserStore } from '@/stores'
import { type UserProfile } from '@/types'

const props = defineProps<{
  user: UserProfile & { isFollowing?: boolean }
}>()

const userStore = useUserStore()
const message = useMessage()

const isFollowing = ref(props.user.isFollowing)

const buttonText = computed(() => {
  return isFollowing.value ? '正在关注' : '关注'
})

async function handleFollowToggle() {
  try {
    if (isFollowing.value) {
      await userStore.unfollow(props.user.username)
    } else {
      await userStore.follow(props.user.username)
    }
    isFollowing.value = !isFollowing.value
  } catch (error: any) {
    message.error(error.message || '操作失败，请稍后重试')
    console.error('关注/取消关注失败:')
  }
}
</script>
