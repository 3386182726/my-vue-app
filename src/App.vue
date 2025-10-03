<template>
  <!-- 不需要布局的页面 -->
  <router-view v-if="route.path === '/login' || route.path === '/register'" />
  <el-container  v-else style="height: 100vh;" > <!-- 必须设置高度 -->
    <!-- 左侧菜单 -->
    <el-aside width="200px">
      <Sidebar :menus="menus" ref="sidebarRef" />
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <el-header height="60px">
        <UserInfo></UserInfo>
        <Navbar :menus="menus" @toggleSidebar="toggleSidebar" />
  
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>

import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import UserInfo from './components/UserAvatar.vue'
import { useRoute } from 'vue-router'
import { ref,computed,watch } from 'vue'
import { routes } from './router'
import { generateMenuFromRoutes,collectPathsFromRoles } from './utils/menu'
import { useUserStore } from './stores/userStore'

const route = useRoute()
const sidebarRef = ref(null)
const userStore = useUserStore()
//  userStore.getUser()

const menus = ref([])
function toggleSidebar() {
  sidebarRef.value.toggleCollapse()
}

watch(
  () => userStore.user,
  (user) => {
    const roles = user?.roles || [] 
    const paths = collectPathsFromRoles(roles)
    menus.value = generateMenuFromRoutes(routes, paths)
    console.log('paths', paths)
    console.log('menus', menus.value)
  }
)
</script>