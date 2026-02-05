<template>
    <div class="layout">
      <div class="main">
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
  const props = defineProps({ menus: Array })

  // 动态计算面包屑
  // 面包屑 computed，只有 menus 有值才计算
  const breadcrumbList = computed(() => {
    if (!props.menus?.length || !route.path) return []
    return findBreadcrumb(props.menus, route.path)
  })
  console.log('breadcrumbList',breadcrumbList.value)
  // 打印调试
  watch(
  () => props.menus,
  (menus) => {
    console.log('menus 更新了:', menus)
  },
  { immediate: true }
)
  </script>