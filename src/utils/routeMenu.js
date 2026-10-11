// utils/routeMenu.js

export const normalizePath = (base = '', path = '') =>
  path.startsWith('/') ? path : `${base}/${path}`.replace(/\/+/g, '/')

export function generateMenuFromRoutes(routes = [], allowedPaths = [], basePath = '') {
  return routes
    .filter(r => !r.meta?.hidden) // 详情页等不进菜单的路由
    .map(r => {
      const fullPath = normalizePath(basePath, r.path)

      // 递归生成子菜单
      const children = r.children?.length
        ? generateMenuFromRoutes(r.children, allowedPaths, fullPath)
        : []

      // 判断当前菜单是否有权限（alwaysShow 标记的路由不依赖后端菜单权限）
      const selfHasAccess =
        r.meta?.alwaysShow ||
        allowedPaths.includes(fullPath) ||
        allowedPaths.includes(r.path.replace('/',''))
      // console.log('selfHasAccess',r.path,allowedPaths,allowedPaths.includes(r.path))
      // 如果自己有权限，或者子菜单有权限 → 保留
      if (  (r.meta?.title && selfHasAccess) || children.length > 0) {
        return {
          fullPath: fullPath,
          path: r.path,
          title: r.meta?.title,
          icon: r.meta?.icon,
          children
        }
      }

      return null
    })
    .filter(Boolean) // 过滤掉 null
}

export function collectPathsFromRoles(roles = []) {
  const pathSet = new Set()
  roles.forEach(role => {
    role.menus?.forEach(menu => {
      if (menu.path) pathSet.add(menu.path)
    })
  })
  return Array.from(pathSet)
}
