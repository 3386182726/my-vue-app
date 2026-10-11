import request from './request'

// 接口路径常量
const MENU_API = '/api/user/menu'

// 全部菜单（树形，返回解包后的 data）
export const fetchMenus = async () => {
  const res = await request.get(`${MENU_API}/all`, { withCredentials: true })
  console.log('menu.res.data', res.data)
  return res.data
}

// 新增/修改菜单
export const saveMenu = (data) =>
  request.post(`${MENU_API}/save`, data, { withCredentials: true })

export default fetchMenus
