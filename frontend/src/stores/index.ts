/**
 * 统一的 Store 入口文件
 *
 * 架构说明：
 * 1. usePostCacheStore - 缓存中心：统一管理所有帖子数据
 * 2. usePostInteractionStore - 交互中心：处理点赞、回复、发帖等交互操作
 * 3. usePostDetailStore - 帖子详情业务：处理帖子详情页面的业务逻辑
 * 4. usePostFeedStore - 主页帖子流业务：处理主页帖子流的业务逻辑
 * 5. useUserStore - 用户状态管理
 */

// 核心层 - 缓存和交互
export { default as usePostCacheStore } from './usePostCacheStore'
export { default as usePostInteractionStore } from './usePostInteractionStore'

// 业务层 - 具体页面和功能
export { default as usePostDetailStore } from './usePostDetailStore'
export { default as usePostFeedStore } from './usePostFeedStore'
export { default as useUserPostStore } from './useUserPostStore'

// 用户和主题
export { default as useUserStore } from './userUserStore'
export { default as useThemeStore } from './useThemeStore'
export { default as useWindowStore } from './useWindowStore'

export type { RecievePostPayload, CreatePostPayload, UserProfile } from '@/types'
