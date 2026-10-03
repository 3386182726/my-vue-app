<template>
  <div class="product-detail-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <el-button type="primary" link @click="goBack">返回列表</el-button>
        </div>
      </template>

      <!-- 商品信息 -->
      <el-descriptions border :column="2" label-width="100px">
        <el-descriptions-item label="名称">{{ product.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ product.category }}</el-descriptions-item>
        <el-descriptions-item label="价格">{{ product.price }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ product.count }}</el-descriptions-item>
      </el-descriptions>

      <!-- 商品图片 -->
       <br/>
      <div class="product-images"> 
        <div class="image-list">
          <el-image
            v-for="(img, index) in imgs"
            :key="img.name"
            :src="img.url"
            :preview-src-list="imgs.map(i => i.url)"
            :initial-index="index"
            fit="cover"
            lazy
          />
        </div>
      </div>
    </el-card>
  </div>
</template>
  
  <script setup>
import { ref, onMounted ,computed} from 'vue'
import { useRouter,useRoute } from 'vue-router'
import api from '../../api/api';
import { mapProductImages } from '../../utils/imageHelper'

const router = useRouter()
// 接收对象
const product = ref({
  name: '',
  categoryName: '',
  price: 0,
  count: 0,
  imgs: []
})
const fetchProductById = async (id) => {
    try {
      const res = await api.get(`/api/product/${id}`);
      product.value = res.data;
    } catch(err) {
      console.log('product2',err)
      loading.value = false;
    }
  };
const imgs = computed(() => mapProductImages(product.value.imgs, 'product'))
const goBack = () => {
  router.push({ name: 'Product' }) // 你的列表路由 name
}
onMounted(async () => {
  // 从 router.state 获取对象
  const id = router.currentRoute.value.params.id
    if (id) {
       await fetchProductById(id)
    } 
})
</script>