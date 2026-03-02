import { markRaw } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import About from '../views/About.vue'
import Settings from '../views/Settings.vue'
import News from '../views/News.vue'
import Login from '../views/user/Login.vue'
import Register from '../views/user/Register.vue'
import Product from '../views/product/Product.vue'
import ProductDetail from '../views/product/ProductDetail.vue'
import Note from '../views/note/Note.vue'
import NoteCategory from '../views/note/NoteCategory.vue'
import NoteDetail from '../views/note/NoteDetail.vue'
import axios from 'axios'
import { useUserStore } from '../stores/userStore'

import { HomeFilled, Setting } from '@element-plus/icons-vue';

export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/',
    component: Dashboard,
    meta: { title: '首页', icon: markRaw(HomeFilled), roles: ['admin', 'user'] },
    name: 'Dashboard'
  },
  {
    path: '/product',
    component: Product,
    meta: { title: '产品', icon: markRaw(HomeFilled), roles: ['admin', 'user'] },
    name: 'Product'
  },
  { path: '/product/:id', component: ProductDetail, name: 'ProductDetail' },
  {
    path: '/notes',
    meta: { title: '文章', icon: markRaw(HomeFilled), roles: ['admin', 'user'], alwaysShow: true },
    name: 'Notes',
    children:[
      {
        path: 'note',
        component: Note,
        meta: { title: '文章',  roles: ['admin', 'user'] },
        name: 'Note',
      },
      {
        path: 'noteCategory',
        component: NoteCategory,
        meta: { title: '文章分类',roles: ['admin', 'user'] },
        name: 'NoteCategory',
      },
    ]
  },
  { path: '/note/:id', component: NoteDetail, name: 'NoteDetail' },
  {
    path: '/management',
    name: 'Management',
    meta: { title: '系统', icon: markRaw(Setting), roles: ['admin'] },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/User.vue'),
        meta: {
          title: '用户', roles: ['Admin'] // 只有 Admin 能访问
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('../views/role/Role.vue'),
        meta: {
          title: '角色', roles: ['Admin'] // 只有 Admin 能访问
        }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('../views/menu/Menu.vue'),
        meta: {
          title: '菜单', roles: ['Admin'] // 只有 Admin 能访问
        }
      },
      {
        path: 'about',
        component: About,
        name: 'About',
        meta: { title: '关于', roles: ['admin', 'user'] }
      },
      {
        path: 'settings',
        component: Settings,
        name: 'Settings',
        meta: { title: '设置', roles: ['admin'] },
        children: [
          {
            path: 'news',
            component: News,
            name: 'News',
            meta: { title: '新闻', roles: ['admin', 'user'] }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 这里添加全局路由守卫

router.beforeEach(async (to, from) => {
  const whiteList = ['/login', '/register']
  const userStore = useUserStore()

  // 1️⃣ 白名单直接放行
  if (whiteList.includes(to.path)) return true
  // 2️⃣ 获取用户信息（缓存或请求后端）
  await userStore.fetchCurrentUser()
  // 3️⃣ 未登录 → 跳转登录页
  if (!userStore.user) {
    return '/login'
  }
  // 5️⃣ 放行
  return true
})

export default router   // ✅ 必须导出 router 实例