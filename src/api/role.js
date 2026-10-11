import request from './request'

// 接口路径常量
const ROLE_API = '/api/user/role'

// 全部角色（下拉选择用，返回解包后的 data）
export const fetchRoles = async () => {
  const res = await request.get(`${ROLE_API}/all`, { withCredentials: true })
  return res.data
}

// 角色列表（含各自已分配菜单）
export const fetchRolesWithMenus = () =>
  request.get(`${ROLE_API}/all/menus`, { withCredentials: true })

// 新增/修改角色
export const saveRole = (data) =>
  request.post(`${ROLE_API}/save`, data, { withCredentials: true })

// 删除角色
export const deleteRole = (id) =>
  request.delete(`${ROLE_API}/${id}`, { withCredentials: true })

// 给角色分配菜单
export const assignRoleMenus = (roleId, menuIds) =>
  request.post(`${ROLE_API}/${roleId}/menus`, menuIds)

export default fetchRoles
