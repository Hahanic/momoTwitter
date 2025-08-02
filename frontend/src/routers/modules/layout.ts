import { type RouteRecordRaw } from 'vue-router'
import Layout from '@/views/layout/index.vue'
import Home from '@/views/layout/home/index.vue'
import More from '@/views/layout/more/index.vue'
import Profile from '@/views/layout/profile/index.vue'

const layoutRoutes: Array<RouteRecordRaw> = [
{
  path: '/',
  component: Layout,
  redirect: '/home',
  children: [
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/explore',
      name: 'Explore',
      redirect: '/explore/for_you',
      component: () => import('@/views/layout/explore/index.vue'),
      children: [
        {
          path: 'for_you',
          name: 'ExploreForYou',
          component: () => import('@/views/layout/explore/children/for_you.vue')
        },
        { 
          path: ':pathMatch(.*)*',
          name: 'ExploreNotFound',
          component: () => import('@/components/404/exploreNotFound.vue')
        }
      ]
    },
    {
      path: '/more',
      name: 'More',
      component: More,
      children: [
        { path: 'account',
          name: 'MoreAccount',
          component: () => import('@/views/layout/more/account/index.vue'),
          meta : {
            requiresAuth: true
          }
        },
        { path: 'settings',
          name: 'MoreSettings',
          component: () => import('@/views/layout/more/settings/index.vue')
        },
      ]
    },

    {
      path: '/compose/post',
      name: 'ComposePost',
      component: Home
    },
    {
      path: ':pathMatch(.*)*',
      name: 'GlobalNotFound',
      component: () => import('@/components/404/globalNotFound.vue')
    }
  ]
}
]

export default layoutRoutes