import request from './request'

// 接口路径常量（模块内部使用）
const USER_LIST_API = '/api/user/all'

// 用户列表
export const fetchUsers = (params) => request.get(USER_LIST_API, { params })

// 新增/修改用户
export const saveUser = (data) =>
  request.post('/api/user/create-user', data, { withCredentials: true })

// 删除用户
export const deleteUser = (id) =>
  request.delete(`/api/user/${id}`, { withCredentials: true })

// 登录
export const login = (data) =>
  request.post('/api/user/login', data, { withCredentials: true })

// 注册
export const register = (data) =>
  request.post('/api/user/register', data, { withCredentials: true })

// 当前登录用户信息
export const fetchCurrentUser = () => request.get('/api/user/me')
