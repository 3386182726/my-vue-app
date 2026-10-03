<template>
    <el-container>
      <el-main>
        <div class="data-table">
            <!-- 搜索框 -->
    <el-input
      v-model="query.searchText"
      placeholder="搜索用户名或邮箱"
      @keyup.enter.native="fetchUsers"
      style="width: 200px; margin-bottom: 10px"
    />
    <el-button type="primary" @click="fetchUsers">搜索</el-button>
    <el-button type="primary" @click="openCreateDialog">创建用户</el-button>
  </div>
      
    <!-- 用户表格 -->
    <el-table
      :data="data.items"
      style="width: 100%"
      @sort-change="handleSortChange"
      :default-sort="{ prop: sortField, order: sortDesc ? 'descending' : 'ascending' }"
    >
      <el-table-column prop="userName" label="用户名" sortable />
      <el-table-column prop="name" label="姓名" sortable />
      <el-table-column label="角色">
  <template #default="{ row }">
    <el-tag
      v-for="role in row.roles"
      :key="role"
      type="success"
      style="margin-right: 4px;"
    >
      {{ role }}
    </el-tag>
  </template>
</el-table-column>
      <el-table-column prop="email" label="邮箱" sortable />
      <el-table-column prop="birthday" label="生日" sortable />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEditDialog(row)">修改</el-button>
          <el-button type="danger" size="small" @click="deleteUser(row)">删除</el-button>
        </template>
      </el-table-column> 
    </el-table>

    <!-- 分页控件 -->
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="data.total"
      layout="total, prev, pager, next, sizes"
      @current-change="fetchUsers"
      @size-change="fetchUsers"
      style="margin-top: 10px"
    />
      </el-main>
  
      <!-- 创建用户弹出框 -->
      <el-dialog  :title="form.id ? '修改用户' : '创建用户'" v-model="showDialog">
        <el-form :model="form" label-width="100px">
          <el-form-item label="用户名称">
            <el-input v-model="form.userName" placeholder="输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="form.name" placeholder="输入姓名"></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱">
            <el-input v-model="form.email" placeholder="输入邮箱"></el-input>
          </el-form-item>
          <el-form-item label="用户角色">
            <el-select
    v-model="form.roles"
    multiple
    filterable
    default-first-option
    :reserve-keyword="false"
    style="width: 240px"
  >
    <el-option
      v-for="item in roleOptions"
      :key="item.name"
      :label="item.name"
      :value="item.name"
    />
  </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
      <div class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitUser">{{ form.id ? '保存' : '创建' }}</el-button>
      </div>
    </template>
      </el-dialog>
    </el-container>
  </template>
  
  <script setup>
import { ref, reactive,onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage,ElMessageBox } from 'element-plus'
import fetchRoles from '../../api/role'
import api from '../../api/api';
import { getList } from '../../api/list';

const { query, data, loading, getList:fetchUsers } = getList('/api/user/all', {
  sortField: 'UserName',sortDesc:false
})

const showDialog = ref(false)
const form = ref({id: '' })
const roleOptions =ref([])

const users = reactive({
  items: [],
  total: 0
})

// 表格排序变化
const handleSortChange = ({ prop, order }) => {
  fetchUsers({ sortField: prop,sortDesc:order === 'descending'})
}
const openCreateDialog = async () => {
  form.value = { id: '', userName: '' } // 空表示创建
  roleOptions.value = await fetchRoles()
  showDialog.value = true
}
const openEditDialog = async (row) => {
  form.value = { ...row } // 空表示创建
  roleOptions.value = await fetchRoles()
  showDialog.value = true
}
const submitUser= async()=>{
  try {
      const res = await api.post('/api/user/create-user', form.value, { withCredentials: true })
      roleOptions.value = res.data
      ElMessage.success('创建用户成功');
      console.log('res.data',res.data)
    } catch (err) {
      ElMessage.error('创建用户失败')
      console.error('创建用户失败:', err)
    }
    showDialog.value = false
    fetchUsers()
}

 // 删除角色
 const deleteUser = (user) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.userName}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 调用删除接口
        await api.delete(`/api/user/${user.id}`, { withCredentials: true })
        ElMessage.success('删除成功')
        fetchUsers() // 刷新列表
      } catch (err) {
        ElMessage.error('删除失败')
        console.error(err)
      }
    })
    .catch(() => {
      // 用户点击取消，不做任何操作
      ElMessage.info('已取消删除')
    })
}
// 初始化
onMounted(() => {
  fetchUsers()
})
</script>