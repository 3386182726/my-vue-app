import axios from 'axios';
import tokenStore from '../stores/tokenStore'

const api = axios;

api.interceptors.request.use(config => {
  if (tokenStore.getToken()) {
    config.headers['Authorization'] = `Bearer ${tokenStore.getToken()}`;
  }
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    tokenStore.removeToken()
    window.location.href = '/login';  // 跳转登录
  }
  return Promise.reject(error);
});

export default api;