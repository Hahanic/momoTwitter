import { createRouter, createWebHistory } from "vue-router"
import layoutRoutes from "./modules/layout.ts"
import userRoutes from "./modules/user.ts"
import useUserStore from "@/stores/user.ts"

const routes = [
  ...layoutRoutes,
  ...userRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirectReason: 'unauthenticated' }
    })
  } else {
    next()
  }
})

export default router