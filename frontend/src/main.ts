import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'
import router from '@/routers/index.ts'
import App from './App.vue'

const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')
