<template>
  <el-card class="note-page">
    <div class="data-table">
      <el-button type="primary" @click="openDialog('add')">新增文章</el-button>
      <el-button type="primary" @click="fetchNotes()">搜索</el-button>
    </div>
    <el-radio-group v-model="query.conditions.categoryId" class="category-filter" style="margin: 10px 0" @change="onCategoryChange">
      <el-radio-button :value="null">全部</el-radio-button>
      <el-radio-button v-for="(item, index) in categories" :key="item.id" :value="item.id"
        :style="categoryStyle(index)">{{ item.name }}</el-radio-button>
    </el-radio-group>
    <el-table :data="data.items" @row-dblclick="handleRowDblClick" style="width: 100%" v-loading="loading">
      <el-table-column show-overflow-tooltip label="名称" min-width="320">
        <template #default="{ row }">
          <span style="font-size:16px;font-family:monospace;font-weight: 600;">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="分类" min-width="60" />
      <el-table-column prop="createdAt" :formatter="createdAtFormatter" label="创建时间" min-width="60" />
      <el-table-column prop="createrName" label="创建人" min-width="60" />
      <el-table-column label="操作" min-width="100">
        <template #default="scope">
          <el-button size="small" @click="handleRowDblClick(scope.row)">详情</el-button>
          <el-button size="small" @click="openDialog('edit', scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="removeNote(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="data.total"
      layout="total, prev, pager, next, sizes" @current-change="fetchNotes" @size-change="fetchNotes"
      style="margin-top: 10px" />

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible">
      <el-form :model="form">
        <el-form-item label="名称">
          <el-input v-model="form.name" class="note-header" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <div style="border: 1px solid #ccc">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig"
              :mode="mode" />
            <Editor style="height: 500px; overflow-y: hidden;" v-model="form.content" :defaultConfig="config"
              :mode="mode" @onCreated="handleCreated" @onFocus="handleFocus" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNote">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchNotes as fetchNotesApi, saveNote, deleteNote, fetchNoteCategories } from '../../api/note'
import { useRouter, useRoute } from 'vue-router'
import { editorConfig } from '../../utils/editorConfig'
import dayjs from 'dayjs';
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted, reactive, computed } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

import { useList } from '../../composables/useList';

const route = useRoute()
const baseUrl = import.meta.env.VITE_API_BASE_URL
const config = editorConfig(baseUrl)
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 工具栏和编辑器配置
const toolbarConfig = {}

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
const handleFocus = (editor) => {
  editor.addMark('fontFamily', '仿宋');
  editor.addMark('fontSize', '16px');
}
// 模板里直接使用 editorRef、valueHtml、toolbarConfig、editorConfig、handleCreated

const dialogVisible = ref(false);
const dialogTitle = ref('');
const categories = ref([])
const createDefaultForm = () => ({
  id: null,
  name: '',
  content: '',
  categoryId: null
})

const form = ref(createDefaultForm())

const { query, data, loading, fetch: fetchNotes } = useList(fetchNotesApi, {
  sortField: '',
  conditions:{'categoryId': null}
})

// 切换分类：回到第一页再查询
const onCategoryChange = () => {
  query.page = 1
  fetchNotes()
}

// 分类按钮配色，按顺序循环取用
const categoryColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9b59b6', '#16a085']
const categoryStyle = (index) => {
  const color = categoryColors[index % categoryColors.length]
  return {
    '--cat-color': color,
    '--cat-bg': `${color}1f`, // 同色 12% 透明度，作未选中浅色底
    '--el-radio-button-checked-bg-color': color,
    '--el-radio-button-checked-border-color': color
  }
}

const openDialog = (type, row = null) => {
  if (type === 'add') {
    form.value = createDefaultForm()
    dialogTitle.value = '新增文章';
  } else if (type === 'edit') {
    dialogTitle.value = '编辑文章';
    form.value = { ...row };
  }
  dialogVisible.value = true;
};

const submitNote = async () => {
  console.log(' form.value', form.value)
  try {
    const res = await saveNote(form.value)
    ElMessage.success('保存文章成功');
    console.log('res.data', res.data)
  } catch (err) {
    ElMessage.error('保存文章失败')
    console.error('保存文章失败:', err)
  }
  dialogVisible.value = false
  fetchNotes()
}

const removeNote = async (id) => {
  await deleteNote(id);
  ElMessage.error('删除文章成功')
  fetchNotes();
};

const fetchCategories = async () => {
  const res = await fetchNoteCategories()
  categories.value = res.data ? res.data : []
  console.log(' categories.value ', categories.value)
}
function createdAtFormatter(row) {
  return dayjs(row.createdAt).format('YYYY-MM-DD');
}
const router = useRouter()
function handleRowDblClick(row) {
  // 跳转到详情页面，传 id，同时把当前页和分类带过去
  const routeQuery = { page: query.page }
  if (query.conditions.categoryId != null) {
    routeQuery.categoryId = query.conditions.categoryId
  }
  router.push({ name: 'NoteDetail', params: { id: row.id }, query: routeQuery })
}
onMounted(() => {
  query.page = Number(route.query.page) || 1
  query.conditions.categoryId = route.query.categoryId
  fetchNotes();
  fetchCategories();
});
</script>

<style scoped>
/*
 * 分类按钮：跟随全局毛玻璃皮肤
 * - 未选中：分类色与白色按"控件透明度"混合的浅色玻璃底 + 彩色文字/边框
 * - 选中：分类色按"控件透明度"混合的玻璃底 + 白字
 * 没有自定义背景图时（皮肤变量缺失）回退到接近原来的浅色底/实色效果
 */
.category-filter :deep(.el-radio-button .el-radio-button__inner) {
  background-color: color-mix(in srgb,
    var(--cat-color, var(--el-color-primary))
    calc(var(--skin-control-alpha, 0.12) * 100%),
    rgba(255, 255, 255, 0.92));
  border-color: var(--cat-color, var(--el-border-color, #dcdfe6));
  color: var(--cat-color, var(--el-text-color-regular));
  backdrop-filter: blur(var(--skin-blur, 0));
  -webkit-backdrop-filter: blur(var(--skin-blur, 0));
}

/* 选中：半透明实心色 + 白字 */
.category-filter :deep(.el-radio-button .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: color-mix(in srgb,
    var(--cat-color, var(--el-color-primary))
    calc(var(--skin-control-alpha, 1) * 100%),
    transparent);
  border-color: var(--cat-color, var(--el-color-primary));
  color: var(--el-color-white);
}
</style>