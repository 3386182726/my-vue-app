import { markRaw } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import About from '../views/system/About.vue'
import Settings from '../views/system/Settings.vue'
import News from '../views/system/News.vue'
import Login from '../views/user/Login.vue'
import Register from '../views/user/Register.vue'
import Product from '../views/product/Product.vue'
import ProductDetail from '../views/product/ProductDetail.vue'
import Note from '../views/note/Note.vue'
import NoteCategory from '../views/note/NoteCategory.vue'
import NoteDetail from '../views/note/NoteDetail.vue'
import { useUserStore } from '../stores/userStore'
import tokenStore from '../utils/auth'
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
    path: '/products',
    meta: { title: '产品', icon: markRaw(HomeFilled), roles: ['admin', 'user'] },
    name: 'Products',
    children:[
      {
        path: 'product',
        component: Product,
        meta: { title: '产品发布',  roles: ['admin', 'user'] },
        name: 'Product',
      },
      {
        // 绝对路径子路由：URL 仍为 /product/:id，同时在 matched 中保留父级层级
        path: '/product/:id',
        component: ProductDetail,
        name: 'ProductDetail',
        meta: { title: '产品详情', hidden: true }
      }
    ]
  },
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
      {
        // 绝对路径子路由：URL 仍为 /note/:id，同时在 matched 中保留父级层级
        path: '/note/:id',
        component: NoteDetail,
        name: 'NoteDetail',
        meta: { title: '文章详情', hidden: true }
      }
    ]
  },
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
          title: '用户', roles: ['admin']
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('../views/role/Role.vue'),
        meta: {
          title: '角色', roles: ['admin']
        }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('../views/menu/Menu.vue'),
        meta: {
          title: '菜单', roles: ['admin']
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
        redirect: '/management/settings/background',
        meta: { title: '设置', roles: ['admin'] },
        children: [
          {
            path: 'background',
            name: 'BackgroundSetting',
            component: () => import('../views/system/BackgroundSetting.vue'),
            meta: { title: '背景图', roles: ['admin'], alwaysShow: true }
          },
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
  const token = tokenStore.getToken()
  // 1️⃣ 白名单直接放行
  if (whiteList.includes(to.path)) return true
  // 1️⃣ 没有 token → 登录
  if (!token) {
    return '/login'
  }
  // 2️⃣ 获取用户信息（缓存或请求后端）
  if (!userStore.user) {
    await userStore.fetchCurrentUser()
  }
  // 3️⃣ 未登录 → 跳转登录页
  if (!userStore.user) {
    return '/login'
  }
  // 5️⃣ 放行
  return true
})

export default router   // ✅ 必须导出 router 实例