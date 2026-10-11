<template>
  <el-breadcrumb separator="/" router class="navbar">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbList"
      :key="item.path"
      :to="index === breadcrumbList.length - 1 ? undefined : { path: item.path }"
    >
      {{ item.name }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 直接取路由匹配链：matched 天然是从根到当前页的层级
const breadcrumbList = computed(() =>
  route.matched
    .filter(r => r.meta?.title)
    .map(r => ({ name: r.meta.title, path: r.path }))
)
</script>

<style scoped>
.navbar {
  padding: 6px 20px 0;
}
</style>
