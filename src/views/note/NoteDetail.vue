<template>
  <div class="product-detail-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
        <span> 文章详情</span>
          <el-button type="primary" link @click="goBack">返回列表</el-button>
        </div>
      </template>

      <!-- 商品信息 -->
      <el-descriptions border column="2" label-width="100px">
        <el-descriptions-item label="名称" span="1">{{ note.name }}</el-descriptions-item>
        <el-descriptions-item label="分类" span="1">{{ note.category }}</el-descriptions-item>
        <el-descriptions-item label="创建人" span="1">{{ note.createrName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" span="1">{{ note.createdAt }}</el-descriptions-item>
      </el-descriptions>

      <!-- 商品图片 -->
       <br/>
      <div class="note-detail" v-html="note.content"> 
      </div>
    </el-card>
  </div>
</template>
  
<script setup>
import { ref, onMounted ,computed} from 'vue'
import { useRouter,useRoute } from 'vue-router'
import api from '../../api/api';

const router = useRouter()
// 接收对象
const note = ref({
  name: '',
  content: '',
  category: null,
  createdAt: '',
  createrName: '',
})
const fetchNoteById = async (id) => {
    try {
      const res = await api.get(`/api/note/${id}`);
      note.value = res.data;
    } catch(err) {
      console.log('note2',err)
      loading.value = false;
    }
  };
const goBack = () => {
  router.push({ name: 'Note' }) // 你的列表路由 name
}
onMounted(async () => {
  // 从 router.state 获取对象
  const id = router.currentRoute.value.params.id
    if (id) {
       await fetchNoteById(id)
    } 
})
</script>