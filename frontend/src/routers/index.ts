import { createRouter, createWebHistory } from "vue-router";

import Layout from '@/views/layout/index.vue'
import Login from '@/views/login/index.vue'
import Register from '@/views/register/index.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/register',
      component: Register
    },
  ]
});