// utils/menu.js

export const normalizePath = (base = '', path = '') =>
  path.startsWith('/') ? path : `${base}/${path}`.replace(/\/+/g, '/')

export function generateMenuFromRoutes(routes = [], allowedPaths = [], basePath = '') {
  console.log()
  return routes
    .map(r => {
      const fullPath = normalizePath(basePath, r.path)

      // 递归生成子菜单
      const children = r.children?.length
        ? generateMenuFromRoutes(r.children, allowedPaths, fullPath)
        : []

      // 判断当前菜单是否有权限
      const selfHasAccess =
      allowedPaths.includes(fullPath) || allowedPaths.includes(r.path.replace('/',''))
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


export function findBreadcrumb(menuList, path, trail = []) {
  console.log('findBreadcrumb',menuList, path, trail)
  for (const menu of menuList) {
    const newTrail = [...trail, { name: menu.title, path: menu.path }]
    if (menu.fullPath === path) return newTrail
    if (menu.children?.length) {
      const childTrail = findBreadcrumb(menu.children, path, newTrail)
      if (childTrail.length) return childTrail
    }
  }
  return []
}