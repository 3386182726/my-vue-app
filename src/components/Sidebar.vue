<template>
  <el-menu
    :default-active="activeMenu"
    router
    :collapse="collapse"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    unique-opened
    style="height: 100%;"
  >
    <SidebarItem v-for="item in menus" :key="item.fullPath" :item="item" />
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'

defineProps({
  menus: {
    type: Array,
    default: () => []
  },
  collapse: Boolean
})

const route = useRoute()
// 同步当前路由 path，菜单自动高亮
const activeMenu = computed(() => route.path)
</script>
