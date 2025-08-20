import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { apiGetOnePost } from '@/api'
import type { RecievePostPayload } from '@/types'

const usePostCacheStore = defineStore('postCache', () => {
  // (key: postId, value: post)
  const posts = ref(new Map<string, RecievePostPayload>())

  // 计算属性：缓存大小
  const cacheSize = computed(() => posts.value.size)

  // 从缓存中获取帖子
  function getPost(postId: string): RecievePostPayload | undefined {
    return posts.value.get(postId)
  }

  // 检查帖子是否存在于缓存
  function hasPost(postId: string): boolean {
    return posts.value.has(postId)
  }

  // 将一批帖子添加到缓存
  function addPosts(postsToAdd: RecievePostPayload[]) {
    for (const post of postsToAdd) {
      posts.value.set(post._id, post)
    }
  }

  // 添加单个帖子到缓存
  function addPost(post: RecievePostPayload) {
    posts.value.set(post._id, post)
  }

  // 更新单个帖子
  function updatePost(postId: string, updatedData: Partial<RecievePostPayload>) {
    const post = posts.value.get(postId)
    if (post) {
      Object.assign(post, updatedData)
      posts.value.set(postId, post) // 确保响应性
    }
  }

  // 从缓存中移除帖子
  function removePost(postId: string) {
    posts.value.delete(postId)
  }

  // 确保帖子存在并返回帖子，如果不存在则从API获取并存入缓存
  async function fetchPostIfNotExists(postId: string): Promise<RecievePostPayload> {
    const existingPost = getPost(postId)
    if (existingPost) {
      return existingPost
    }

    const newPost = await apiGetOnePost(postId)
    addPost(newPost)
    return newPost
  }

  // 清空缓存
  function clearCache() {
    posts.value.clear()
  }

  // 根据条件过滤缓存中的帖子
  function findPosts(predicate: (post: RecievePostPayload) => boolean): RecievePostPayload[] {
    return Array.from(posts.value.values()).filter(predicate)
  }

  // 获取所有缓存的帖子
  function getAllPosts(): RecievePostPayload[] {
    return Array.from(posts.value.values())
  }

  // 获取缓存统计信息
  function getCacheStats() {
    const allPosts = getAllPosts()
    return {
      total: allPosts.length,
      byType: {
        standard: allPosts.filter((p) => p.postType === 'standard').length,
        reply: allPosts.filter((p) => p.postType === 'reply').length,
      },
    }
  }

  return {
    // 状态
    cacheSize,

    // 基础操作
    getPost,
    hasPost,
    addPost,
    addPosts,
    updatePost,
    removePost,
    clearCache,

    // 高级操作
    fetchPostIfNotExists,
    findPosts,
    getAllPosts,
    getCacheStats,
  }
})

export default usePostCacheStore
