<template>
    <el-header height="60px" class="app-header">
      <div class="logo">ZMK@WhyWqyZddLhCyWyj</div>
  
      <div class="header-right">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-avatar :src="user.avatar" size="small" /> 
            <el-text class="mx-1" type="primary"> {{ user.name }}</el-text>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <template #dropdown>
            <el-dropdown-item @click="goProfile">个人资料</el-dropdown-item>
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
          </template>
        </el-dropdown>
      </div>
    </el-header>
  </template>
  
  <script setup>
  import { ref,computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '../stores/userStore'
  import tokenStore from '../stores/tokenStore'

  const router = useRouter()
  const userStore = useUserStore()
  userStore.getUser()
  const user =userStore.user
 user.avatar ='https://i.pravatar.cc/40'
  function goProfile() {
    router.push('/profile')
  }
  
  function logout() {
    console.log('退出登录')
    userStore.clearUser()
    tokenStore.removeToken()
    router.push('/login')
  }
  </script>