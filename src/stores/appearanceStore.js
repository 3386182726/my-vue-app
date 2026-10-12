import { defineStore } from 'pinia'

const BG_KEY = 'app_bg_url'
const MODE_KEY = 'app_bg_mode'
const SKIN_KEY = 'app_skin_settings'

// 毛玻璃外观默认参数
export const DEFAULT_SKIN = {
  panelAlpha: 0.45,   // 内容区（卡片/面包屑）白色不透明度
  controlAlpha: 0.45, // 控件（按钮/输入框/下拉/单选按钮）白色不透明度
  barAlpha: 0.45,     // 侧栏/logo 行深色不透明度（初始与内容卡片一致）
  blur: 12,           // 毛玻璃模糊像素
  overlay: 0.25,      // 背景图整体压暗程度
  fit: 'cover'        // 填充模式：cover 填充 / contain 适应 / stretch 拉伸 / tile 平铺 / auto 原图
}

function loadSkin() {
  try {
    return { ...DEFAULT_SKIN, ...JSON.parse(localStorage.getItem(SKIN_KEY) || '{}') }
  } catch {
    return { ...DEFAULT_SKIN }
  }
}

// 兼容旧数据：只有 bgUrl 没有 mode 时视为单图模式
const savedUrl = localStorage.getItem(BG_KEY) || ''
const savedMode = localStorage.getItem(MODE_KEY) || (savedUrl ? 'single' : 'none')

export const useAppearanceStore = defineStore('appearance', {
  state: () => ({
    // dataURL 或远程 URL；空串表示默认主题
    bgUrl: savedUrl,
    // none（默认） | single（单张） | carousel（轮播）
    mode: savedMode,
    skin: loadSkin()
  }),
  actions: {
    _persist() {
      if (this.bgUrl) {
        localStorage.setItem(BG_KEY, this.bgUrl)
      } else {
        localStorage.removeItem(BG_KEY)
      }
      if (this.mode !== 'none') {
        localStorage.setItem(MODE_KEY, this.mode)
      } else {
        localStorage.removeItem(MODE_KEY)
      }
    },
    // 设置单张背景
    setSingle(url) {
      this.mode = 'single'
      this.bgUrl = url
      this._persist()
    },
    // 轮播切换帧：只更新当前显示，不改变模式
    setCarouselFrame(url) {
      this.bgUrl = url
      localStorage.setItem(BG_KEY, url)
    },
    enableCarousel(firstUrl) {
      this.mode = 'carousel'
      if (firstUrl) this.bgUrl = firstUrl
      this._persist()
    },
    // 恢复默认主题
    clearBg() {
      this.mode = 'none'
      this.bgUrl = ''
      this._persist()
    },
    // 更新毛玻璃参数（滑块拖动时调用）
    updateSkin(patch) {
      this.skin = { ...this.skin, ...patch }
      localStorage.setItem(SKIN_KEY, JSON.stringify(this.skin))
    },
    resetSkin() {
      this.skin = { ...DEFAULT_SKIN }
      localStorage.removeItem(SKIN_KEY)
    }
  }
})
