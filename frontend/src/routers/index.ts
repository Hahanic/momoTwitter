import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import layoutRoutes from './modules/layout.ts'
import userRoutes from './modules/user.ts'

import useUserStore from '@/stores/user.ts'
import useWindowStore from '@/stores/window.ts'

const routes = [...layoutRoutes, ...userRoutes]

// 导航栈判断 back / forward / new / refresh
const _navStack: string[] = []
let _navIndex = -1
function recordDirection(to: RouteLocationNormalized): 'new' | 'back' | 'forward' | 'refresh' {
  const key = to.fullPath
  const existIdx = _navStack.indexOf(key)
  if (existIdx === -1) {
    // 新分支：截断 forward 分支后 push
    _navStack.splice(_navIndex + 1)
    _navStack.push(key)
    _navIndex = _navStack.length - 1
    return 'new'
  }
  if (existIdx < _navIndex) {
    _navIndex = existIdx
    return 'back'
  }
  if (existIdx > _navIndex) {
    _navIndex = existIdx
    return 'forward'
  }
  return 'refresh'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const windowStore = useWindowStore()

  // 如果用户未登录且访问的页面需要身份验证，则重定向到登录页面
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirectReason: 'unauthenticated' },
    })
  } else {
    next()
  }

  // 记录导航方向，这里主要是要恢复滚动条位置
  const dir = recordDirection(to)
  windowStore.setBackNavigation(dir === 'back')
})

export default router
