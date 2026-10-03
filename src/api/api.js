import axios from 'axios';
import tokenStore from '../stores/tokenStore'

const api = axios;

api.interceptors.request.use(config => {
  if (tokenStore.getToken()) {
    config.headers['Authorization'] = `Bearer ${tokenStore.getToken()}`;
  }
  console.log('tokenStore.getToken()',tokenStore.getToken())
  return config;
});

api.interceptors.response.use(response => response, error => {
  const status = error.response?.status
  const originalRequest = error.config
  if (status === 401 && !originalRequest.url.includes('/login')) {
    tokenStore.removeToken()
    router.push('/login')  // 跳转登录
  }
  return Promise.reject(error);
});

export default api;