import axios from 'axios'
import api from './api'

const fetchRoles = async () => {
    try {
      const res = await api.get('/api/user/role/all', { withCredentials: true })
      return res.data
    } catch (err) {
      console.error('获取角色失败:', err)
      throw err 
    }
  }

  export default fetchRoles