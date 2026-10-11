<template>
    <div class="app-header">
      <div class="header-left">
        <el-icon class="collapse-btn" @click="$emit('toggleSidebar')">
          <Expand v-if="collapse" />
          <Fold v-else />
        </el-icon>
        <div class="logo">ZMK@WhyWqyZddLhCyWyj</div>
      </div>

      <div class="header-right">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-avatar :src="user?.avatar || 'https://i.pravatar.cc/40'" size="small" />
            <el-text class="mx-1" type="primary"> {{ user?.name }}</el-text>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-item @click="goProfile">个人资料</el-dropdown-item>
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
          </template>
        </el-dropdown>
      </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, Fold, Expand } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/userStore'
import tokenStore from '../utils/auth'

defineProps({
  collapse: Boolean
})
defineEmits(['toggleSidebar'])

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)

function goProfile() {
  router.push('/profile')
}

function logout() {
  userStore.clearUser()
  tokenStore.removeToken()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  height: 56px;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #fff;
}
.collapse-btn:hover {
  color: #ffd04b;
}
</style>
