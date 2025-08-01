import { createRouter, createWebHistory } from "vue-router";

import Layout from '@/views/layout/index.vue'
import Home from '@/views/layout/home/index.vue'
import Login from '@/views/login/index.vue'
import More from '@/views/layout/more/index.vue'
import Profile from '@/views/layout/profile/index.vue'
import Register from '@/views/register/index.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
      component: Layout,
      children: [
        {
          path: '/home',
          component: Home
        },
        {
          path: '/profile',
          component: Profile
        },
        {
          path: '/more',
          component: More,
          children: [
            { path: 'account',
              component: () => import('@/views/layout/more/account/index.vue')
            },
            { path: 'settings',
              component: () => import('@/views/layout/more/settings/index.vue')
            },
          ]
        },
        // explore routes
        {
          path: '/explore',
          redirect: '/explore/for_you',
          component: () => import('@/views/layout/explore/index.vue'),
          children: [
            {
              path: 'for_you',
              component: () => import('@/components/explore/for_you.vue')
            },
            { 
              path: ':pathMatch(.*)*',
              name: 'ExploreNotFound',
              component: () => import('@/components/404/exploreNotFound.vue')
            }
          ]
        },
        {
          path: '/compose/post',
          component: Home
        },
        {
          path: ':pathMatch(.*)*',
          name: 'GlobalNotFound',
          component: () => import('@/components/404/globalNotFound.vue')
        }
      ]
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