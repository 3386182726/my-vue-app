<template>
    <div class="layout">
      <div class="main">
        333
        <Header />
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="item.path">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
  </template>
  <script setup>
  import { ref, computed, watch,defineProps  } from 'vue'
  import { useRoute } from 'vue-router'
  import { findBreadcrumb } from '../utils/menu'
  const route = useRoute()
  const activeMenu = ref(route.path)
  const props = defineProps({
    menus: Array
  })
  const breadcrumbList = computed(() => findBreadcrumb(props.menus, route.path))
  console.log('breadcrumbList',props.menus,route.path,breadcrumbList)
  watch(() => route.path, (newPath) => activeMenu.value = newPath)
  </script>