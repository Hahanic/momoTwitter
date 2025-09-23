import { computed, reactive, toRefs, watch, type Ref } from 'vue'

import { fetchPostReplies } from '@/api'
import { usePostCacheStore, usePostInteractionStore } from '@/stores'
import { type Post } from '@/types'

// 用于帖子详情页和模态框的组合式函数
// 两个组件分别管理各自的状态，互不干扰，依赖PostCacheStore获取数据
export function usePostDetail(postIdRef: Ref<string | null>) {
  const postCacheStore = usePostCacheStore()
  const interactionStore = usePostInteractionStore()

  const state = reactive({
    currentPostId: null as string | null,
    parentChain: [] as string[],
    replyIds: [] as string[],
    isLoading: false,
    isLoadingReplies: false,
    isLoadingParentChain: false,
    repliesCursor: null as string | null,
    hasMoreReplies: true,
    seq: 0,
  })

  const currentPost = computed(() => {
    return state.currentPostId ? postCacheStore.getPost(state.currentPostId) : null
  })

  const parentPosts = computed(() => {
    return state.parentChain.map((id) => postCacheStore.getPost(id)).filter(Boolean) as Post[]
  })

  const replies = computed(() => {
    return state.replyIds.map((id) => postCacheStore.getPost(id)).filter(Boolean) as Post[]
  })

  function reset() {
    state.currentPostId = null
    state.parentChain = []
    state.replyIds = []
    state.repliesCursor = null
    state.hasMoreReplies = true
    state.isLoadingReplies = false
    state.isLoadingParentChain = false
  }

  async function loadPostDetail(id: string) {
    if (state.currentPostId === id) return
    state.isLoading = true
    const mySeq = ++state.seq
    try {
      reset()
      state.currentPostId = id
      await postCacheStore.fetchPostIfNotExists(id)
      // TO UNDERSTAND
      if (mySeq !== state.seq) return
      state.isLoading = false

      const post = postCacheStore.getPost(id)
      // 并行触发但各自对齐序列号
      if (post?.postType === 'reply' && post.parentPostId) {
        void buildParentChain(post.parentPostId, mySeq)
      }
      void loadReplies(mySeq)
    } catch (error) {
      console.error('加载帖子详情失败:', error)
    } finally {
      state.isLoading = false
    }
  }

  async function buildParentChain(startParentId: string, seqAtStart = state.seq) {
    if (state.isLoadingParentChain) return
    state.isLoadingParentChain = true
    try {
      const chain: string[] = []
      let cur: string | undefined = startParentId
      while (cur) {
        const p = await postCacheStore.fetchPostIfNotExists(cur)
        chain.unshift(p._id)
        cur = p.postType === 'reply' ? p.parentPostId : undefined
        if (state.seq !== seqAtStart) return // 丢弃过期
      }
      if (state.seq !== seqAtStart) return
      state.parentChain = chain
    } finally {
      state.isLoadingParentChain = false
    }
  }

  // 通用：获取从起始帖子到根帖的父链（包含起始 id 对应的帖子）
  async function getParentPosts(startId: string) {
    const chain: string[] = []
    const posts: Post[] = []
    let cur: string | undefined = startId
    while (cur) {
      const p = await postCacheStore.fetchPostIfNotExists(cur)
      chain.unshift(p._id)
      posts.unshift(p)
      cur = p.postType === 'reply' ? p.parentPostId : undefined
    }
    return { chain, posts }
  }

  async function loadReplies(seqAtStart = state.seq) {
    if (!state.currentPostId || state.isLoadingReplies || !state.hasMoreReplies) return
    state.isLoadingReplies = true
    try {
      const res = await fetchPostReplies(state.currentPostId, state.repliesCursor)
      if (state.seq !== seqAtStart) return
      postCacheStore.addPosts(res.replies)
      const ids = res.replies.map((r) => r._id)
      // 去重
      const merged = new Set([...state.replyIds, ...ids])
      state.replyIds = Array.from(merged)

      state.repliesCursor = res.nextCursor
      state.hasMoreReplies = res.nextCursor !== null

      if (res.parentPost && state.currentPostId) {
        postCacheStore.updatePost(state.currentPostId, { stats: res.parentPost.stats })
      }
    } finally {
      state.isLoadingReplies = false
    }
  }

  async function createAndAddPost(payload: Parameters<typeof interactionStore.handleCreateReply>[0]) {
    if (!state.currentPostId) throw new Error('当前帖子不存在')

    const newReply = await interactionStore.handleCreateReply({
      ...payload,
      parentPostId: state.currentPostId,
    })
    // 去重并前插
    state.replyIds = [newReply._id, ...state.replyIds.filter((id) => id !== newReply._id)]
    return newReply
  }

  // 当路由/外部传入的 postId 改变时触发加载
  watch(
    postIdRef,
    (id) => {
      if (typeof id === 'string') void loadPostDetail(id)
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    currentPost,
    parentPosts,
    replies,
    loadPostDetail,
    loadReplies,
    createAndAddPost,
    getParentPosts,
    reset,
  }
}
