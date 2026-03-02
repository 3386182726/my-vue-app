<template>
    <el-card class="product-page">
      <div  class="data-table">
        <el-button type="primary" @click="openDialog('add')">新增文章分类</el-button>
  </div>
      <el-table :data="products.items" @row-dblclick="handleRowDblClick" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="category" label="分类"
         :formatter="CategoriesFormatter"
        />
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeNoteCategory(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
          <!-- 分页控件 -->
    <el-pagination
      :total="products.total"
      layout="total, prev, pager, next, sizes"
      @current-change="fetchProducts"
      @size-change="fetchProducts"
      style="margin-top: 10px"
    />

      <!-- 添加/编辑对话框 -->
      <el-dialog :title="dialogTitle" v-model="dialogVisible">
        <el-form :model="form">
          <el-form-item label="名称" >
            <el-input v-model="form.name" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNoteCategory">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </template>
  
  <script setup>
  import { ref, onMounted,reactive,computed } from 'vue';
  import { ElMessage,ElMessageBox } from 'element-plus'
  import api from '../../api/api';
  import axios from 'axios';
  import { useRouter } from 'vue-router'

  const BASE_URL = import.meta.env.VITE_API_BASE_URL 
  const noteCategories = reactive({
  items: [],
  total: 0
  })
  const loading = ref(false);
  
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const categories = ref([])
  const form = ref({ id: null, name: ''});
  const fetchNoteCategories = async () => {
    // loading.value = true;

    try {
      const res = await api.get(`/api/note`);
      noteCategories.items = res.data.items;
      noteCategories.total =res.data.total
      console.log('note',notes)
    } catch(err) {
      console.log('note3',err)
      loading.value = false;
    }
  };
  
  const openDialog = (type, row = null) => {
    if (type === 'add') {
      dialogTitle.value = '新增文章分类';
      form.value = { id: null, name: ''};
    } else if (type === 'edit') {
      dialogTitle.value = '编辑文章分类';
      form.value = { ...row };
    }
    dialogVisible.value = true;
  };
  
  const submitNoteCategory= async()=>{
    console.log(' form.value', form.value)
    try {
        const res = await api.post('/api/noteCategory', form.value)
        ElMessage.success('保存文章分类成功');
        console.log('res.data',res.data)
      } catch (err) {
        ElMessage.error('保存文章分类失败')
        console.error('保存文章分类失败:', err)
      }
      dialogVisible.value = false
      fetchNoteCategories()
  }
    
  const removeNoteCategory = async (id) => {
    await api.delete(`/api/noteCategory/${id}`);
    ElMessage.error('删除文章分类成功')
    fetchNoteCategories();
  };

  const router = useRouter()
  onMounted(() => {
    fetchNoteCategories();
  });
  </script>
  