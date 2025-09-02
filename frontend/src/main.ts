import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './style.css'

import i18n from '@/i18n.ts'
import router from '@/routers/index.ts'

const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(i18n)

app.mount('#app')
