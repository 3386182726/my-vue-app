import axios from 'axios'
import api from './api'

export const fetchMenus = async () => {
    try {
      const res = await api.get('/api/user/menu/all', { withCredentials: true })
      console.log('menu.res.data',res.data)
      return res.data
    } catch (err) {
      console.error('获取菜单失败:', err)
      throw err 
    }
  }

  export default fetchMenus