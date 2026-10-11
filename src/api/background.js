import request from './request'

// 用户背景图接口
const BG_API = '/api/user/userbackgroundimage'

// 图库变更事件（上传/删除后通知 App.vue 同步轮播列表）
export const BACKGROUND_CHANGED_EVENT = 'app-backgrounds-changed'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// 背景图由 userservice 托管，经网关访问需带 /user 前缀（/user/uploads/...）
const STATIC_PREFIX = '/user'

// 后端返回相对路径时拼上网关地址；已是完整 URL 则原样使用
// 兼容 BASE_URL 结尾带不带斜杠、相对路径开头带不带斜杠、是否已带服务前缀
function resolveUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  const base = BASE_URL.replace(/\/+$/, '')
  if (url.startsWith(`${STATIC_PREFIX}/`)) return base + (url.startsWith('/') ? url : `/${url}`)
  const path = url.startsWith('/') ? url : `/${url}`
  return base + STATIC_PREFIX + path
}

// 兼容不同返回结构：字符串数组 或 { id, url/path/imageUrl } 对象数组
function normalize(list) {
  return (list || []).map((item) => {
    if (typeof item === 'string') return { id: item, url: resolveUrl(item) }
    const raw = item.url ?? item.path ?? item.imageUrl ?? item.imagePath ?? ''
    return { id: item.id, url: resolveUrl(raw) }
  })
}

// 背景图列表
export async function fetchBackgroundImages() {
  const res = await request.get(`${BG_API}/all`)
  return normalize(res.data)
}

// 上传背景图（FormData 字段名 file，与产品图片上传一致）
// 返回新记录，便于上传后选中
export async function uploadBackgroundImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await request.post(`${BG_API}/upload`, formData)
  const data = res.data
  if (typeof data === 'string') return { id: null, url: resolveUrl(data) }
  return {
    id: data?.id ?? null,
    url: resolveUrl(data?.url ?? data?.path)
  }
}

// 删除背景图
export const deleteBackgroundImage = (id) =>
  request.delete(`${BG_API}/${id}`)

export function emitBackgroundsChanged() {
  window.dispatchEvent(new Event(BACKGROUND_CHANGED_EVENT))
}
