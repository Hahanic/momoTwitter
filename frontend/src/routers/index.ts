import { createRouter, createWebHistory } from 'vue-router'

import layoutRoutes from './modules/layout.ts'

import useUserStore from '@/stores/userUserStore.ts'
import useWindowStore from '@/stores/useWindowStore.ts'

// 浏览器的滚动恢复交给自己来做
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual'
}

const routes = [...layoutRoutes]

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
      name: 'Home',
      query: { modal: 'login' },
    })
  } else {
    next()
  }
  // 记录导航方向，这里主要是要恢复滚动条位置
  const dir = windowStore.recordDirection(to)
  windowStore.setBackNavigation(dir === 'back')
  windowStore.setNavType(dir)
})

export default router
