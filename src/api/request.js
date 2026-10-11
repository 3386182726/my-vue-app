import axios from 'axios';
import tokenStore from '../utils/auth'
import router from '../router'

// 独立实例：拦截器和默认配置只作用于本实例，不污染全局 axios
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
});

request.interceptors.request.use(config => {
  if (tokenStore.getToken()) {
    config.headers['Authorization'] = `Bearer ${tokenStore.getToken()}`;
  }
  console.log('tokenStore.getToken()', tokenStore.getToken())
  return config;
});

request.interceptors.response.use(response => response, error => {
  const status = error.response?.status
  const originalRequest = error.config
  if (status === 401 && !originalRequest.url.includes('/login')) {
    tokenStore.removeToken()
    router.push('/login')  // 跳转登录
  }
  return Promise.reject(error);
});

export default request;
