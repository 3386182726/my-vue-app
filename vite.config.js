import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

//https
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [vue()],

  // https
  // server: {
  //   port: 5173,       // 前端端口
  //   https: true
  // },
  // plugins:[
  //   vue(),
  //   basicSsl(),
  // ]
})