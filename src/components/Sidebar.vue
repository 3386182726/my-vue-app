<template>
  <el-menu
    :default-active="activeMenu"
    router
    :collapse="isCollapse"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    unique-opened
    style="height: 100%;"
  >
    <!-- 直接循环 SidebarItem -->
    <SidebarItem v-for="item in props.menus" :key="item.fullPath" :item="item" />
  </el-menu>
</template>

<script setup>
import { ref, watch ,defineProps,markRaw,computed ,onMounted  } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'

const isCollapse = ref(false)
const route = useRoute()
const props = defineProps({
    menus: Array
  })
// 推荐用 computed 同步路由 path
const activeMenu = computed(() => route.path)

watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
  console.log('Sidebar-路由变化了', newPath,activeMenu.value )
})
</script>