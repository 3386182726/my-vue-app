import { defineStore } from 'pinia'
import { fetchCurrentUser as fetchCurrentUserApi } from '../api/user'

let userPromise = null
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  actions: {
    // 从内存或 sessionStorage 恢复用户信息，返回恢复结果
    getUser() {
      if (this.user) return this.user
      try {
        const userData = sessionStorage.getItem('user')
        if (userData) {
          this.user = JSON.parse(userData)
        }
      } catch (error) {
        console.error('解析本地用户信息失败:', error)
        sessionStorage.removeItem('user') // 清除无效数据
      }
      return this.user
    },
    setUser(data) {
      this.user = data
      sessionStorage.setItem('user', JSON.stringify(data))
    },
    clearUser() {
      this.user = null
      userPromise = null
      sessionStorage.removeItem('user')
    },
    // 获取当前用户信息：内存/本地缓存命中则不发请求
    async fetchCurrentUser() {
      if (this.getUser()) {
        return this.user
      }
      // 同步保存 Promise，并发调用复用同一请求
      if (!userPromise) {
        userPromise = fetchCurrentUserApi()
          .then(res => {
            this.setUser(res.data)
            return this.user
          })
          .catch((err) => {
            // 401 已由 request 拦截器统一处理（跳登录），其余错误打印便于排查
            if (err.response?.status !== 401) {
              console.error('获取用户信息失败:', err)
            }
            this.user = null
            return null
          })
          .finally(() => {
            userPromise = null
          })
      }
      return userPromise
    }
  }
})
