<template>
    <el-container>

      <el-main>
        <div  class="data-table">
            <el-button type="primary" @click="openCreateDialog">新增菜单</el-button>
  </div>
        <!-- 树形表格展示菜单 -->
        <el-table :data="menuList" style="width: 100%" row-key="id" border default-expand-all>
          <el-table-column prop="name" label="菜单名称" />
          <el-table-column prop="path" label="路由Path" />
         
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteMenu(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
  
      <!-- 添加/编辑菜单对话框 -->
      <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : '新增菜单'">
        <el-form :model="form" :rules="rules" ref="menuForm" label-width="100px">
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="路由Path" prop="path">
            <el-input v-model="form.path" />
          </el-form-item>
          <el-form-item label="上级菜单">
            <el-tree-select
              v-model="form.parentId"
              :data="menuList"
              :props="{ value: 'id', label: 'name', children: 'children' }"
              check-strictly
              placeholder="请选择上级菜单"
            />
          </el-form-item>
        </el-form>
  
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMenu">保存</el-button>
        </template>
      </el-dialog>
    </el-container>
  </template>
  
  <script setup>
  import { ref ,onMounted} from 'vue'
    import axios from 'axios'
    import fetchMenus from '../../api/menu'
    import api from '../../api/api';
    const menuList = ref([])
  
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  
  const form = ref({
    id: '',
    name: '',
    path: '',
    parentId: null,
    order: 1
  })
  
  const rules = {
    name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路由Path', trigger: 'blur' }]
  }
  
  const openCreateDialog = () => {
    isEdit.value = false
    form.value = { id: '', name: '', path: '', parentId: null, order: 1 }
    dialogVisible.value = true
  }
  
  const openEditDialog = (row) => {
    isEdit.value = true
    console.log('row',row)
    form.value = { ...row }
    dialogVisible.value = true
  }

  const saveMenu = async () => {
    try {
      await api.post(`/api/user/menu/save`,  form.value, { withCredentials: true })
      form.value = { id: '', name: '' }
      dialogVisible.value = false
      console.log('menu1')
      menuList.value = await fetchMenus() // 刷新列表
      console.log('menu2')
    } catch (err) {
      console.error('保存菜单失败:', err)
    }
  }
  
  const deleteMenu = (id) => {
    // 调接口删除
    console.log('删除', id)
  }

onMounted(async () => {  // 将 onMounted 设置为 async 函数
  console.log('menu3')
  menuList.value = await fetchMenus()  // 使用 await 调用异步函数
  console.log('menuList',menuList.value)
})
  </script>