import { type RouteRecordRaw } from 'vue-router'

import Home from '@/views/layout/home/index.vue'
import Layout from '@/views/layout/index.vue'
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
        component: Home,
      },
      {
        path: '/home/post/:postId/replies',
        name: 'PostDetail',
        component: () => import('@/views/layout/home/postDetail/index.vue'),
      },
      {
        path: '/profile/:username',
        name: 'Profile',
        component: Profile,
        redirect: (to) => {
          return { name: 'ProfilePosts', params: { username: to.params.username } }
        },
        children: [
          {
            path: '',
            name: 'ProfilePosts',
            component: () => import('@/views/layout/profile/children/posts.vue'),
          },
          {
            path: 'replies',
            name: 'ProfileReplies',
            component: () => import('@/views/layout/profile/children/replies.vue'),
          },
          {
            path: 'likes',
            name: 'ProfileLikes',
            component: () => import('@/views/layout/profile/children/likes.vue'),
          },
          {
            path: 'bookmarks',
            name: 'ProfileBookmarks',
            component: () => import('@/views/layout/profile/children/bookmarks.vue'),
          },
        ],
      },
      {
        path: '/bot',
        name: 'Bot',
        component: () => import('@/views/layout/bot/index.vue'),
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
            component: () => import('@/views/layout/explore/children/for_you.vue'),
          },
          {
            path: ':pathMatch(.*)*',
            name: 'ExploreNotFound',
            component: () => import('@/components/status/exploreNotFound.vue'),
          },
        ],
      },
      {
        path: '/more',
        name: 'More',
        component: More,
        children: [
          {
            path: 'account',
            name: 'MoreAccount',
            component: () => import('@/views/layout/more/account/index.vue'),
          },
          {
            path: 'settings',
            name: 'MoreSettings',
            component: () => import('@/views/layout/more/settings/index.vue'),
          },
          {
            path: 'security',
            name: 'MoreSecurity',
            component: () => import('@/views/layout/more/security/index.vue'),
          },
        ],
      },
      {
        path: ':pathMatch(.*)*',
        name: 'GlobalNotFound',
        component: () => import('@/components/status/globalNotFound.vue'),
      },
    ],
  },
]

export default layoutRoutes
