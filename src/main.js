import { createApp } from 'vue'
import App from './App.vue'

// 引入 Element Plus
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
import './style.css'
import router from './router'
import axios from 'axios'
import { createPinia } from 'pinia'

// 后端地址（开发环境常见）
// axios.defaults.baseURL = 'https://localhost:7207/'
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.baseURL = BASE_URL
// axios.defaults.baseURL = 'http://localhost:8080/'
// 如果用 cookie 认证，还需要带上这一句
// axios.defaults.withCredentials = true
export default axios

const pinia = createPinia()
const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount('#app')



