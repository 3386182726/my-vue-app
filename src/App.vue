<template>
  <!-- 不需要布局的页面 -->
  <router-view v-if="route.path === '/login' || route.path === '/register'" />
  <el-container
    v-else
    class="layout"
    :class="{ 'has-bg': bgUrl }"
    :style="bgStyle"
  >
    <!-- 左侧菜单 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" style="transition: width 0.28s;">
      <Sidebar :menus="menus" :collapse="isCollapse" />
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <el-header height="auto">
        <AppHeader :collapse="isCollapse" @toggleSidebar="isCollapse = !isCollapse" />
        <Navbar />
      </el-header>

      <el-main style="--el-main-padding: 6px 20px 16px;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>

import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import AppHeader from './components/AppHeader.vue'
import { useRoute } from 'vue-router'
import { ref, shallowRef, computed, watch, onMounted, onUnmounted } from 'vue'
import { routes } from './router'
import { generateMenuFromRoutes, collectPathsFromRoles } from './utils/routeMenu'
import { useUserStore } from './stores/userStore'
import { useAppearanceStore } from './stores/appearanceStore'
import { fetchBackgroundImages, BACKGROUND_CHANGED_EVENT } from './api/background'

const route = useRoute()
const userStore = useUserStore()
const appearanceStore = useAppearanceStore()

const isCollapse = ref(false)

// 填充模式 → CSS background-size / repeat 映射
const FIT_CSS = {
  cover:   { size: 'cover',       repeat: 'no-repeat' },
  contain: { size: 'contain',     repeat: 'no-repeat' },
  stretch: { size: '100% 100%',   repeat: 'no-repeat' },
  tile:    { size: 'auto',        repeat: 'repeat' },
  auto:    { size: 'auto',        repeat: 'no-repeat' }
}

// 菜单完全由当前用户的角色权限派生
const menus = computed(() => {
  const roles = userStore.user?.roles || []
  return generateMenuFromRoutes(routes, collectPathsFromRoles(roles))
})

const bgUrl = computed(() => appearanceStore.bgUrl)
// 通过 CSS 变量把背景图地址和毛玻璃参数交给样式层
const bgStyle = computed(() => {
  const fit = FIT_CSS[appearanceStore.skin.fit] || FIT_CSS.cover
  return {
    ...(bgUrl.value ? { '--app-bg-image': `url("${bgUrl.value}")` } : {}),
    '--skin-panel-alpha': appearanceStore.skin.panelAlpha,
    '--skin-control-alpha': appearanceStore.skin.controlAlpha,
    '--skin-bar-alpha': appearanceStore.skin.barAlpha,
    '--skin-blur': `${appearanceStore.skin.blur}px`,
    '--skin-overlay-alpha': appearanceStore.skin.overlay,
    '--skin-bg-size': fit.size,
    '--skin-bg-repeat': fit.repeat
  }
})

// 把毛玻璃变量同步到 <html>，让 teleport 到 body 的弹窗、下拉浮层也能读取；
// 同时切换 has-app-bg 标记，控制这些浮层是否启用毛玻璃
function applySkinVars() {
  const root = document.documentElement
  const fit = FIT_CSS[appearanceStore.skin.fit] || FIT_CSS.cover
  root.style.setProperty('--skin-panel-alpha', appearanceStore.skin.panelAlpha)
  root.style.setProperty('--skin-control-alpha', appearanceStore.skin.controlAlpha)
  root.style.setProperty('--skin-bar-alpha', appearanceStore.skin.barAlpha)
  root.style.setProperty('--skin-blur', `${appearanceStore.skin.blur}px`)
  root.style.setProperty('--skin-overlay-alpha', appearanceStore.skin.overlay)
  root.style.setProperty('--skin-bg-size', fit.size)
  root.style.setProperty('--skin-bg-repeat', fit.repeat)
  root.classList.toggle('has-app-bg', !!appearanceStore.bgUrl)
}
watch(
  () => [appearanceStore.skin, appearanceStore.bgUrl],
  applySkinVars,
  { deep: true, immediate: true }
)

// ===== 背景轮播 =====
const CAROUSEL_INTERVAL = 15000
// 图片是较大的 dataURL，用 shallowRef 避免深度响应式开销
const bgImages = shallowRef([])
let carouselTimer = null

function stopCarouselTimer() {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

function startCarouselTimer() {
  stopCarouselTimer()
  const list = bgImages.value
  if (appearanceStore.mode !== 'carousel' || !list.length) return
  let idx = 0
  const showFrame = () => appearanceStore.setCarouselFrame(list[idx % list.length].url)
  showFrame()
  idx++
  carouselTimer = setInterval(() => {
    showFrame()
    idx++
  }, CAROUSEL_INTERVAL)
}

// 模式切换时启动/停止定时器
watch(() => appearanceStore.mode, startCarouselTimer)

async function reloadImages() {
  bgImages.value = await fetchBackgroundImages()
  if (appearanceStore.mode === 'carousel') {
    if (bgImages.value.length) {
      startCarouselTimer()
    } else {
      // 图片被删光，自动退出轮播
      appearanceStore.clearBg()
    }
  }
}

function onImagesChanged() {
  reloadImages()
}

onMounted(() => {
  reloadImages()
  window.addEventListener(BACKGROUND_CHANGED_EVENT, onImagesChanged)
})
onUnmounted(() => {
  stopCarouselTimer()
  window.removeEventListener(BACKGROUND_CHANGED_EVENT, onImagesChanged)
})
</script>

<style scoped>
/* 布局始终占满视口高度，内容再短也不留白底 */
.layout {
  height: 100vh;
}

/* 内容区为弹性容器，仅主布局生效；登录/注册页有自己的 el-main，不受影响 */
.layout :deep(.el-main) {
  display: flex;
  flex-direction: column;
}
/* 只让页面主体（唯一根元素；多卡片时的最后一张，如背景图库）撑满剩余高度，
   避免把背景设置页顶部的外观卡片等辅助区块也拉高 */
.layout :deep(.el-main > :last-child) {
  flex: 1;
  min-height: 0;
}

/* 有自定义背景图时：全屏铺图 + 暗色遮罩压暗，保证内容可读 */
.layout.has-bg {
  background-image: var(--app-bg-image);
  background-size: var(--skin-bg-size);
  background-repeat: var(--skin-bg-repeat);
  background-position: center;
  background-attachment: fixed;

  /*
   * 文字颜色跟随内容区透明度联动（始终保持深色，不翻白）：
   * panelAlpha 高（卡片接近纯白）→ Element Plus 标准深灰色
   * panelAlpha 低（卡片透、背景花哨）→ 在原色基础上继续加深、趋近纯黑以保证分量
   * 四级文字色保持原有层次，整体同比例过渡
   */
  --skin-text-color: color-mix(in srgb, #303133 calc(var(--skin-panel-alpha) * 100%), #000000);
  --el-text-color-primary: var(--skin-text-color);
  --el-text-color-regular: color-mix(in srgb, #606266 calc(var(--skin-panel-alpha) * 100%), #1d1f22);
  --el-text-color-secondary: color-mix(in srgb, #909399 calc(var(--skin-panel-alpha) * 100%), #4a4d52);
  --el-text-color-placeholder: color-mix(in srgb, #a8abb2 calc(var(--skin-panel-alpha) * 100%), #6b6e75);
}
.layout.has-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, var(--skin-overlay-alpha));
  z-index: 0;
  pointer-events: none;
}
.layout.has-bg > * {
  position: relative;
  z-index: 1;
}

/* 侧栏：深色毛玻璃 */
.layout.has-bg :deep(.el-aside) {
  background-color: rgba(30, 34, 40, var(--skin-bar-alpha));
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
}
.layout.has-bg :deep(.el-menu) {
  background-color: transparent !important;
}
.layout.has-bg :deep(.el-menu-item:hover),
.layout.has-bg :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.12) !important;
}
.layout.has-bg :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.18) !important;
}

/* 顶栏整体透明，由内部两块各自呈现毛玻璃 */
.layout.has-bg :deep(.el-header) {
  background: transparent;
}
/* logo 行：深色毛玻璃；文字/图标颜色跟随内容区透明度联动 */
.layout.has-bg :deep(.app-header) {
  background-color: rgba(30, 34, 40, var(--skin-bar-alpha));
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
  color: var(--skin-text-color);
}
.layout.has-bg :deep(.app-header .collapse-btn) {
  color: var(--skin-text-color);
}
/* 面包屑行：浅色毛玻璃，不透明度与内容卡片一致 */
.layout.has-bg :deep(.navbar) {
  background-color: rgba(255, 255, 255, var(--skin-panel-alpha));
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
  padding-bottom: 6px;
  border-bottom-color: rgba(255, 255, 255, 0.4);
}

/* 内容卡片：浅色毛玻璃（弹窗 teleport 到 body，不受影响仍为白底） */
.layout.has-bg :deep(.el-card) {
  --el-card-bg-color: rgba(255, 255, 255, var(--skin-panel-alpha));
  --el-card-border-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
}

/* 卡片内表格：透明底，表头/悬停行用半透明白，让背景透出来 */
.layout.has-bg :deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, calc(var(--skin-panel-alpha) * 0.5));
  --el-table-row-hover-bg-color: rgba(255, 255, 255, calc(var(--skin-panel-alpha) * 0.65));
  --el-table-border-color: rgba(0, 0, 0, 0.08);
}
.layout.has-bg :deep(.el-table th.el-table__cell),
.layout.has-bg :deep(.el-table tr),
.layout.has-bg :deep(.el-table td.el-table__cell) {
  background-color: transparent;
}

/* 分页按钮去白底 */
.layout.has-bg :deep(.el-pagination .btn-prev),
.layout.has-bg :deep(.el-pagination .btn-next),
.layout.has-bg :deep(.el-pagination .el-pager li) {
  background-color: transparent;
}
</style>

<!-- 非 scoped：需要命中 teleport 到 body 的下拉浮层，以及外观弹窗里的控件 -->
<style>
/* 控件统一毛玻璃，不透明度由"控件透明度"滑块控制（--skin-control-alpha） */

/* ===== 按钮：默认按钮白色毛玻璃 ===== */
.layout.has-bg .el-button,
.appearance-dialog .el-button {
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
}
.layout.has-bg .el-button:not(.el-button--primary, .el-button--success, .el-button--warning,
  .el-button--danger, .el-button--info, .is-text, .is-link),
.appearance-dialog .el-button:not(.el-button--primary, .el-button--success, .el-button--warning,
  .el-button--danger, .el-button--info, .is-text, .is-link) {
  --el-button-bg-color: rgba(255, 255, 255, var(--skin-control-alpha));
  --el-button-border-color: rgba(255, 255, 255, 0.55);
  --el-button-hover-bg-color: rgba(255, 255, 255, min(var(--skin-control-alpha) + 0.18, 0.98));
  --el-button-hover-border-color: rgba(255, 255, 255, 0.85);
  --el-button-active-bg-color: rgba(255, 255, 255, min(var(--skin-control-alpha) + 0.1, 0.98));
  --el-button-active-border-color: rgba(255, 255, 255, 0.7);
}

/* 彩色按钮：保留语义色，透明度跟随"控件透明度"滑块 */
.layout.has-bg .el-button--primary,
.appearance-dialog .el-button--primary {
  --el-button-bg-color: color-mix(in srgb, var(--el-color-primary) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-border-color: color-mix(in srgb, var(--el-color-primary) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
  --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) calc(min(var(--skin-control-alpha) + 0.18, 0.98) * 100%), transparent);
  --el-button-hover-border-color: var(--el-color-primary);
  --el-button-active-bg-color: color-mix(in srgb, var(--el-color-primary) calc(min(var(--skin-control-alpha) + 0.1, 0.98) * 100%), transparent);
  --el-button-active-border-color: var(--el-color-primary);
}
.layout.has-bg .el-button--success,
.appearance-dialog .el-button--success {
  --el-button-bg-color: color-mix(in srgb, var(--el-color-success) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-border-color: color-mix(in srgb, var(--el-color-success) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
  --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-success) calc(min(var(--skin-control-alpha) + 0.18, 0.98) * 100%), transparent);
  --el-button-hover-border-color: var(--el-color-success);
  --el-button-active-bg-color: color-mix(in srgb, var(--el-color-success) calc(min(var(--skin-control-alpha) + 0.1, 0.98) * 100%), transparent);
  --el-button-active-border-color: var(--el-color-success);
}
.layout.has-bg .el-button--warning,
.appearance-dialog .el-button--warning {
  --el-button-bg-color: color-mix(in srgb, var(--el-color-warning) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-border-color: color-mix(in srgb, var(--el-color-warning) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
  --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-warning) calc(min(var(--skin-control-alpha) + 0.18, 0.98) * 100%), transparent);
  --el-button-hover-border-color: var(--el-color-warning);
  --el-button-active-bg-color: color-mix(in srgb, var(--el-color-warning) calc(min(var(--skin-control-alpha) + 0.1, 0.98) * 100%), transparent);
  --el-button-active-border-color: var(--el-color-warning);
}
.layout.has-bg .el-button--danger,
.appearance-dialog .el-button--danger {
  --el-button-bg-color: color-mix(in srgb, var(--el-color-danger) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-border-color: color-mix(in srgb, var(--el-color-danger) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
  --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-danger) calc(min(var(--skin-control-alpha) + 0.18, 0.98) * 100%), transparent);
  --el-button-hover-border-color: var(--el-color-danger);
  --el-button-active-bg-color: color-mix(in srgb, var(--el-color-danger) calc(min(var(--skin-control-alpha) + 0.1, 0.98) * 100%), transparent);
  --el-button-active-border-color: var(--el-color-danger);
}
.layout.has-bg .el-button--info,
.appearance-dialog .el-button--info {
  --el-button-bg-color: color-mix(in srgb, var(--el-color-info) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-border-color: color-mix(in srgb, var(--el-color-info) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
  --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-info) calc(min(var(--skin-control-alpha) + 0.18, 0.98) * 100%), transparent);
  --el-button-hover-border-color: var(--el-color-info);
  --el-button-active-bg-color: color-mix(in srgb, var(--el-color-info) calc(min(var(--skin-control-alpha) + 0.1, 0.98) * 100%), transparent);
  --el-button-active-border-color: var(--el-color-info);
}

/* ===== 禁用态按钮：EP 用独立的 disabled 变量（默认浅实色），也要跟随滑块 ===== */
.layout.has-bg .el-button.is-disabled,
.appearance-dialog .el-button.is-disabled {
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
}
.layout.has-bg .el-button.is-disabled:not(.el-button--primary, .el-button--success, .el-button--warning,
  .el-button--danger, .el-button--info),
.appearance-dialog .el-button.is-disabled:not(.el-button--primary, .el-button--success, .el-button--warning,
  .el-button--danger, .el-button--info) {
  --el-button-disabled-bg-color: rgba(255, 255, 255, var(--skin-control-alpha));
  --el-button-disabled-border-color: rgba(255, 255, 255, 0.45);
}
.layout.has-bg .el-button--primary.is-disabled,
.appearance-dialog .el-button--primary.is-disabled {
  --el-button-disabled-bg-color: color-mix(in srgb, var(--el-color-primary) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-disabled-border-color: color-mix(in srgb, var(--el-color-primary) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
}
.layout.has-bg .el-button--success.is-disabled,
.appearance-dialog .el-button--success.is-disabled {
  --el-button-disabled-bg-color: color-mix(in srgb, var(--el-color-success) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-disabled-border-color: color-mix(in srgb, var(--el-color-success) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
}
.layout.has-bg .el-button--warning.is-disabled,
.appearance-dialog .el-button--warning.is-disabled {
  --el-button-disabled-bg-color: color-mix(in srgb, var(--el-color-warning) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-disabled-border-color: color-mix(in srgb, var(--el-color-warning) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
}
.layout.has-bg .el-button--danger.is-disabled,
.appearance-dialog .el-button--danger.is-disabled {
  --el-button-disabled-bg-color: color-mix(in srgb, var(--el-color-danger) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-disabled-border-color: color-mix(in srgb, var(--el-color-danger) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
}
.layout.has-bg .el-button--info.is-disabled,
.appearance-dialog .el-button--info.is-disabled {
  --el-button-disabled-bg-color: color-mix(in srgb, var(--el-color-info) calc(var(--skin-control-alpha) * 100%), transparent);
  --el-button-disabled-border-color: color-mix(in srgb, var(--el-color-info) calc(min(var(--skin-control-alpha) + 0.1, 1) * 100%), transparent);
}

/* ===== 输入框 / 下拉选择触发器：白色毛玻璃 ===== */
.layout.has-bg .el-input__wrapper,
.layout.has-bg .el-select__wrapper,
.layout.has-bg .el-textarea__inner {
  background-color: rgba(255, 255, 255, var(--skin-control-alpha));
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
}
.layout.has-bg .el-input__wrapper,
.layout.has-bg .el-select__wrapper,
.layout.has-bg .el-textarea__inner {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.55) inset;
}
.layout.has-bg .el-input__wrapper:hover,
.layout.has-bg .el-select__wrapper:hover,
.layout.has-bg .el-textarea__inner:hover {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.85) inset;
}
.layout.has-bg .el-input__wrapper.is-focus,
.layout.has-bg .el-select__wrapper.is-focused,
.layout.has-bg .el-textarea__inner.is-focus {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}
/* 数字输入框的加减按钮去掉自带白底 */
.layout.has-bg .el-input-number__decrease,
.layout.has-bg .el-input-number__increase {
  background-color: transparent;
}

/* ===== el-radio-button：未选中毛玻璃，选中保留主题色 ===== */
.layout.has-bg .el-radio-button,
.appearance-dialog .el-radio-button {
  --el-radio-button-bg-color: rgba(255, 255, 255, var(--skin-control-alpha));
  --el-radio-button-border-color: rgba(255, 255, 255, 0.55);
  --el-radio-button-checked-bg-color: color-mix(in srgb, var(--el-color-primary) 72%, transparent);
  --el-radio-button-checked-border-color: var(--el-color-primary);
}
.layout.has-bg .el-radio-button__inner,
.appearance-dialog .el-radio-button__inner {
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
}

/* ===== 下拉浮层（teleport 到 body）：高不透明度毛玻璃，保证选项可读 ===== */
html.has-app-bg .el-select__popper.el-popper {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(var(--skin-blur));
  -webkit-backdrop-filter: blur(var(--skin-blur));
}
html.has-app-bg .el-select__popper .el-select-dropdown {
  background: transparent;
  border: none;
}
html.has-app-bg .el-select__popper .el-popper__arrow::before {
  background: rgba(255, 255, 255, 0.82);
  border: none;
}
</style>
