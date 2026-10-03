<template>
      <div>
        <el-breadcrumb separator="/" router>
          <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index"  :to="{ path: item.path }">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
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
    return findBreadcrumb(props.menus,route.path)
  })
  // 打印调试
  watch(
    () => props.menus,
    (menus) => {
      console.log('menus 更新了:', menus)
    },
    { immediate: true }
  )
  watch(breadcrumbList, (val) => {
    console.log('breadcrumbList 更新:', val)
  }, { immediate: true })
  </script>