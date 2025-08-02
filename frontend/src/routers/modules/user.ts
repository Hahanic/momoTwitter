import { type RouteRecordRaw } from 'vue-router'

const Login = () => import('@/views/login/index.vue');
const Register = () => import('@/views/register/index.vue');

const userRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
]

export default userRoutes