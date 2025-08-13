import { createRouter, createWebHistory } from 'vue-router'
import layoutRoutes from './modules/layout.ts'
import userRoutes from './modules/user.ts'
import useUserStore from '@/stores/user.ts'

const routes = [...layoutRoutes, ...userRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  // 如果用户未登录且访问的页面需要身份验证，则重定向到登录页面
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirectReason: 'unauthenticated' },
    })
  } else {
    next()
  }
})

export default router
