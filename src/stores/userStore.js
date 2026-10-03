import { defineStore } from 'pinia'
import axios from 'axios'
import tokenStore from '../stores/tokenStore'

let userPromise = null
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  actions: {
    getUser() {
      // 安全地从 localStorage 读取用户信息
      try {
        console.log('getUser1')
        const userData = sessionStorage.getItem('user')
        console.log('getUser2',userData)
        if (userData) {
          this.user = JSON.parse(userData)
        }
      } catch (error) {
        console.error('Failed to parse user data from sessionStorage:', error)
        sessionStorage.removeItem('user') // 清除无效数据
      }
    },
    setUser(data) {
      this.user = data
      sessionStorage.setItem('user', JSON.stringify(data))
      const userData = sessionStorage.getItem('user')
      console.log('userData1',userData)
    },
    clearUser() {
      this.user = null
      userPromise =null
      sessionStorage.removeItem('user');
    },
    // 获取当前用户信息
    async fetchCurrentUser() {
      if (this.user){
        return this.user
      } 
      if (!userPromise) {
        userPromise = await axios.get('/api/user/me', 
          {
            headers: {
            Authorization: `Bearer ${tokenStore.getToken()}`  // 添加 token
            }
          })
          .then(res => {
            this.setUser(res.data)
            return this.user
          })
          .catch(() => {
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