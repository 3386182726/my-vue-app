<template>
    <el-container>
      <el-main>
        <div  class="data-table">
    <el-button type="primary" @click="openCreateDialog">创建角色</el-button>
  </div>
        <!-- 角色列表 -->
        <el-table :data="roles" style="width: 100%">
      <el-table-column prop="name" label="角色名"></el-table-column>
      <el-table-column label="操作" width="380">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEditDialog(row)">修改</el-button>
          <el-button type="danger" size="small" @click="deleteRole(row)">删除</el-button>
          <el-button type="primary" size="small" @click="openAssignMenuDialog(row)">分配角色菜单</el-button>
        </template>
      </el-table-column>
    </el-table>
      </el-main>
  
      <!-- 创建角色弹出框 -->
      <el-dialog  :title="form.id ? '修改角色' : '创建角色'" v-model="showDialog">
        <el-form :model="form">
          <el-form-item label="角色名称">
            <el-input v-model="form.name" placeholder="输入角色名"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
      <div class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRole">{{ form.id ? '保存' : '创建' }}</el-button>
      </div>
    </template>
      </el-dialog>

       <!-- 菜单分配对话框 -->
  <el-dialog v-model="showDialog2" title="分配菜单" @close="resetDialog">
    <!-- 使用 el-tree 组件展示树形结构 -->
    <el-tree
    ref="tree"
      :data="menuList" 
      :props="treeProps" 
      :default-checked-keys="selectedMenuIds"  
      node-key="id" 
      show-checkbox
       @check-change="handleCheckChange"
    >
    </el-tree>
    <template #footer>
    <div class="dialog-footer">
      <el-button @click="assignMenu">保存</el-button>
      <el-button @click="showDialog2 = false">取消</el-button>
      </div>
    </template>
  </el-dialog>

    </el-container>
  </template>
  
  <script setup>
  import { ref, onMounted   } from 'vue'
  import axios from 'axios'
  import { ElMessage , ElMessageBox } from 'element-plus'
    import fetchMenus from '../../api/menu'
    import api from '../../api/api';

  const roles = ref([])
  const showDialog = ref(false)
  const form = ref({id: '',  name: '' })
  const showDialog2 = ref(false) 
  const selectedMenuIds = ref([]) // 保存已选中的菜单ID
  const menuList = ref([])
  const treeProps = ref({
  children: 'children',  // 子节点的字段
  label: 'name',  // 节点的名称字段
})
const tree = ref(null);
const selectedRow = ref(null); 

  const fetchRolesWithMenus = async () => {
    console.log('1111')
    try {
      const res = await api.get('/api/user/role/all/menus', { withCredentials: true })
      roles.value = res.data
      console.log('roles.value',roles.value)
    } catch (err) {
      console.error('获取角色失败:', err)
    }
  }
  const openCreateDialog = () => {
  form.value = { id: '', name: '' } // 空表示创建
  showDialog.value = true
}
const openEditDialog = (row) => {
  console.log('row',row)
  form.value = { ...row } // 有 id 表示修改
  showDialog.value = true
}
  const submitRole  = async () => {
    if (!form.value.name) return
    try {
      await api.post(`/api/user/role/save`,  form.value, { withCredentials: true })
      form.value = { id: '', name: '' }
      showDialog.value = false
      fetchRolesWithMenus() // 刷新列表
    } catch (err) {
      console.error('角色失败:', err)
    }
  }

  // 删除角色
  const deleteRole = (role) => {
  ElMessageBox.confirm(
    `确定要删除角色 "${role.name}" 吗？`,
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
        await api.delete(`/api/user/role/${role.id}`, { withCredentials: true })
        ElMessage.success('删除成功')
        fetchRolesWithMenus() // 刷新列表
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

// 打开分配菜单对话框
const openAssignMenuDialog =async  (role) => {
  selectedRow.value =role
  console.log('selectedRow.value',selectedRow.value)
  menuList.value =  await fetchMenus() 
  selectedMenuIds.value = role.menus.map(menu => String(menu.id)) || [] // 如果角色已有菜单分配，预选中
  console.log(' menuList.value ', menuList.value )
  showDialog2.value = true
}

// 保存分配的菜单
const assignMenu = async () => {
  var roleId =selectedRow.value.id
  console.log('selectedMenuIds.value',selectedMenuIds.value)
  try {
    await api.post(`/api/user/role/${roleId}/menus`,   selectedMenuIds.value )
    showDialog2.value = false
    selectedRow.value =null
    ElMessage.success('分配菜单成功')
    fetchRolesWithMenus() // 重新加载角色和菜单
  } catch (error) {
    console.error('分配菜单失败:', error)
  }
}

const handleCheckChange = () => {
  // 确保 tree 已经绑定好
  if (tree.value) {
    selectedMenuIds.value = tree.value.getCheckedKeys(); // 获取选中的节点ID
    console.log('选中的菜单 ID:', selectedMenuIds.value); // 打印选中的菜单项
  }
};

  onMounted(async () => {
    await  fetchRolesWithMenus()
    menuList.value =  await fetchMenus() 
  })
  </script>