import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './style.css'

import router from '@/routers/index.ts'

const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')
