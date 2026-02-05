<template>
    <el-card class="product-page">
      <div  class="data-table">
        <el-button type="primary" @click="openDialog('add')">新增文章</el-button>
  </div>
      <el-table :data="products.items" @row-dblclick="handleRowDblClick" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="category" label="分类"
         :formatter="CategoriesFormatter"
        />
        <el-table-column prop="createAt" label="创建时间" />
        <el-table-column prop="content" label="内容" />
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" @click="handleRowDblClick( scope.row)">详情</el-button>
            <el-button size="small" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeProduct(scope.row.id)">删除</el-button>
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
          <el-form-item label="分类">
            <el-select v-model="form.category" placeholder="请选择分类">
              <el-option
                v-for="c in categories"
                :key="c.id"
                :label="c.name"
                :value="c.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="内容" >
            <div style="border: 1px solid #ccc">
            <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
            />
            <Editor
                style="height: 500px; overflow-y: hidden;"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
            />
            </div>
        </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProduct">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </template>
  
  <script setup>
  import { ElMessage,ElMessageBox } from 'element-plus'
  import api from '../../api/api';
  import axios from 'axios';
  import { useRouter } from 'vue-router'
import { mapProductImages } from '../../utils/imageHelper'

import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted , reactive,computed} from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

// 注册组件（在 <script setup> 中用 defineComponent 或直接 import 后自动可用）
const components = { Editor, Toolbar } // 可选，如果你在模板里直接用 Editor/Toolbar，也可以不写

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('<p>hello</p>')

// 模拟 ajax 异步获取内容
onMounted(() => {
  setTimeout(() => {
    valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
  }, 1500)
})

// 工具栏和编辑器配置
const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }

// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 编辑器创建回调
const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例
}

// 模板里直接使用 editorRef、valueHtml、toolbarConfig、editorConfig、handleCreated

  const BASE_URL = import.meta.env.VITE_API_BASE_URL 
  const products = reactive({
  items: [],
  total: 0
  })
  const loading = ref(false);
  
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const categories = ref([])
  const form = ref({ id: null, name: '', category: '', price: 0 ,imgs:[]});
  const fetchProducts = async () => {
    // loading.value = true;

    try {
      const res = await api.get(`/api/note`);
      products.items = res.data.items;
      products.total =res.data.total
      console.log('note',notes)
    } catch(err) {
      console.log('note3',err)
      loading.value = false;
    }
  };
  
  const openDialog = (type, row = null) => {
    if (type === 'add') {
      dialogTitle.value = '新增文章';
      form.value = { id: null, name: '', category: '', price: 0 ,imgs:[]};
    } else if (type === 'edit') {
      dialogTitle.value = '编辑文章';
      form.value = { ...row };
    }
    dialogVisible.value = true;
  };
  
  const submitProduct= async()=>{
    console.log(' form.value', form.value)
    try {
        const res = await api.post('/api/product', form.value)
        ElMessage.success('保存文章成功');
        console.log('res.data',res.data)
      } catch (err) {
        ElMessage.error('保存文章失败')
        console.error('保存文章失败:', err)
      }
      dialogVisible.value = false
      fetchProducts()
  }
    
  const removeProduct = async (id) => {
    await api.delete(`/api/product/${id}`);
    ElMessage.error('删除文章成功')
    fetchProducts();
  };
  
  const uploadImage = async (file) => {
    console.log('file2',file.raw instanceof File) 
    const formData = new FormData()
    formData.append('file', file.raw)

    const res = await api.post('/api/product/upload/',  formData)
    console.log('res.data',res.data)
    form.value.imgs.push(res.data.url)
    console.log('form',form)
  }
  function handleRemove(file) {
    // 删除原始数据
    form.value.imgs = form.value.imgs.filter(img => img.name !== file.name)
  }
  const fetchCategories = async ()=>
  {
    const res = await api.get('/api/product/categories')
    categories.value = res.data
    console.log(' categories.value ', categories.value )
  }
  function CategoriesFormatter(row,clumn)
  {
    return categories.value.find(c => c.id === row.category)?.name || '未知';
  }
  const imgs = computed(() =>
    mapProductImages(form.value.imgs,'product')
  )
  const router = useRouter()
  function handleRowDblClick(row) {
    // row.category = 
    // 跳转到详情页面，传 id
    router.push({ name: 'ProductDetail',   params: { id: row.id } })
  }
  onMounted(() => {
    fetchProducts();
    fetchCategories();
  });
  </script>
  