import request from './request'

// 接口路径常量，供 useList 与本模块方法共用
const PRODUCT_API = '/api/product'

// 产品列表
export const fetchProducts = (params) => request.get(PRODUCT_API, { params })

// 产品详情
export const fetchProductById = (id) => request.get(`${PRODUCT_API}/${id}`)

// 新增/保存产品
export const saveProduct = (data) => request.post(PRODUCT_API, data)

// 删除产品
export const deleteProduct = (id) => request.delete(`${PRODUCT_API}/${id}`)

// 秒杀
export const seckill = (id) => request.post(`${PRODUCT_API}/${id}/Seckill`)

// 产品图片上传
export const uploadProductImage = (formData) =>
  request.post(`${PRODUCT_API}/upload/`, formData)

// 产品分类
export const fetchProductCategories = () => request.get(`${PRODUCT_API}/categories`)
