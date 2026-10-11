import { createApp } from 'vue'
import App from './App.vue'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import router from './router'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

// 过滤 element-plus 表格插槽的无害警告（详见 el-table 已知问题）
app.config.warnHandler = (msg, instance, trace) => {
  if (msg.includes('invoked outside of the render function')) return
  console.warn(msg, trace)
}

app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount('#app')



