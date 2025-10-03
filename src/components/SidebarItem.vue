<template>
  <!-- 有子菜单 -->
  <el-sub-menu v-if="item.children?.length" :index="item.fullPath">
    <template #title>
      <el-icon v-if="item?.icon" >
        <component :is="item.icon" />
    </el-icon>
      <span>{{ item?.title }}</span>
    </template>
    <SidebarItem
      v-for="child in item.children"
      :key="child.fullPath"
      :item="child"
    />
  </el-sub-menu>

  <!-- 叶子菜单 -->
  <el-menu-item v-else :index="item.fullPath">
       <el-icon v-if="item?.icon" >
        <component :is="item.icon" />
    </el-icon>
    <span>{{ item?.title }}</span>
  </el-menu-item>
</template>

<script setup>
import {markRaw, defineProps } from 'vue'

const props = defineProps({
  item: Object
})
</script>