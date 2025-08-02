import { defineStore } from "pinia"
import useUserStore from "./user"
import { createPost as apiCreatePost, getPosts as apiGetPost } from "@/api"
import { type RecievePostPayload, type CreatePostPayload } from "@/types"
import { ref } from "vue"

const usePostStore = defineStore('post', () => {
  // 储存帖子列表
  const posts = ref<RecievePostPayload[]>([])
  // 用户编辑的帖子
  const editingPost = ref<CreatePostPayload | null>(null)
  // 控制发帖的状态
  const isPosting = ref<boolean>(false)
  // 控制加载帖子的状态
  const isLoading = ref<boolean>(false)

  // 获取userStore实例
  const userStore = useUserStore()

  // 发帖方法
  async function createPost(payload: CreatePostPayload) {
    if (!userStore.isAuthenticated) {
      throw new Error("用户未登录，无法发帖")
    }
    isPosting.value = true
    try {
      // 调用API创建帖子
      const response = await apiCreatePost(payload)
      const newPost = response
      console.log(newPost)
      // 将新帖子添加到列表最前面
      // if (newPost.postType === 'standard') {
      //   posts.value.unshift(newPost)
      // }
      // 更新用户发帖数
      // if (userStore.user?.stats) {
      //   userStore.user.stats.postsCount++
      // }
    } catch (error) {
        throw error
    } finally {
      isPosting.value = false
    }
  }

  // 主页加载帖子
  async function getPosts(page: number = 1) {
    try {
      isLoading.value = true

      const response = await apiGetPost(page)

      posts.value.push(...response.data.posts)

    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    posts,
    isPosting,
    createPost,
    isLoading,
    getPosts
  }
    
})

export default usePostStore