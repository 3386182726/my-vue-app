<template>
  <el-card>
    <template #header>
      <div class="toolbar">
        <el-space wrap>
          <el-upload
            multiple
            accept="image/*"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button type="primary" :loading="uploading">
              {{ uploading ? '处理中...' : '上传图片' }}
            </el-button>
          </el-upload>
          <el-button type="success" :disabled="selectedId === null" @click="setAsBackground">
            设置为背景图
          </el-button>
          <el-button :type="mode === 'carousel' ? 'warning' : 'info'" @click="toggleCarousel">
            {{ mode === 'carousel' ? '停止轮播' : '轮播背景图' }}
          </el-button>
          <el-button @click="appearanceVisible = true">外观设置</el-button>
          <el-button text :disabled="!bgUrl" @click="resetTheme">恢复默认</el-button>
        </el-space>
        <el-text size="small" type="info">{{ statusText }}</el-text>
      </div>
    </template>

    <el-empty v-if="!images.length" description="还没有背景图，点击上方按钮上传" />

    <div v-else class="masonry">
      <div
        v-for="(img, index) in images"
        :key="img.id"
        class="masonry-item"
        :class="{ selected: selectedId === img.id }"
      >
        <el-image
          class="thumb"
          :src="img.url"
          :preview-src-list="srcList"
          :initial-index="index"
          fit="cover"
          loading="lazy"
          hide-on-click-modal
        />
        <!-- 选中按钮 -->
        <button type="button" class="pick-btn" @click.stop="selectedId = img.id">
          <el-icon v-if="selectedId === img.id"><Check /></el-icon>
        </button>
        <!-- 删除按钮 -->
        <button type="button" class="del-btn" @click.stop="removeImage(img)">
          <el-icon><Delete /></el-icon>
        </button>
        <!-- 当前单图标记 -->
        <div v-if="mode !== 'carousel' && bgUrl === img.url" class="badge">当前背景</div>
      </div>
    </div>
  </el-card>

  <el-dialog
    v-model="appearanceVisible"
    title="外观设置"
    width="640px"
    class="appearance-dialog"
    modal-class="appearance-dialog-mask"
  >
    <el-form label-position="left" label-width="130px">
      <el-form-item label="填充模式">
        <el-radio-group
          :model-value="skin.fit"
          @update:model-value="v => updateSkin({ fit: v })"
        >
          <el-radio-button value="cover">填充</el-radio-button>
          <el-radio-button value="contain">适应</el-radio-button>
          <el-radio-button value="stretch">拉伸</el-radio-button>
          <el-radio-button value="tile">平铺</el-radio-button>
          <el-radio-button value="auto">原图</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="内容区透明度">
        <el-slider :model-value="skin.panelAlpha" :min="0.05" :max="0.95" :step="0.01"
          @input="v => updateSkin({ panelAlpha: v })" />
      </el-form-item>
      <el-form-item label="控件透明度">
        <el-slider :model-value="skin.controlAlpha" :min="0.05" :max="0.95" :step="0.01"
          @input="v => updateSkin({ controlAlpha: v })" />
      </el-form-item>
      <el-form-item label="侧栏/顶栏透明度">
        <el-slider :model-value="skin.barAlpha" :min="0.05" :max="0.95" :step="0.01"
          @input="v => updateSkin({ barAlpha: v })" />
      </el-form-item>
      <el-form-item label="模糊程度">
        <el-slider :model-value="skin.blur" :min="0" :max="30" :step="1"
          @input="v => updateSkin({ blur: v })" />
      </el-form-item>
      <el-form-item label="背景压暗">
        <el-slider :model-value="skin.overlay" :min="0" :max="0.8" :step="0.01"
          @input="v => updateSkin({ overlay: v })" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="resetSkin">恢复默认</el-button>
      <el-button type="primary" @click="appearanceVisible = false">完成</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Delete } from '@element-plus/icons-vue'
import {
  fetchBackgroundImages,
  uploadBackgroundImage,
  deleteBackgroundImage,
  emitBackgroundsChanged
} from '../../api/background'
import { useAppearanceStore } from '../../stores/appearanceStore'

const appearanceStore = useAppearanceStore()

const skin = computed(() => appearanceStore.skin)
const updateSkin = (patch) => appearanceStore.updateSkin(patch)
const resetSkin = () => appearanceStore.resetSkin()

const images = ref([])
const selectedId = ref(null)
const uploading = ref(false)
const appearanceVisible = ref(false)

const srcList = computed(() => images.value.map(i => i.url))
const bgUrl = computed(() => appearanceStore.bgUrl)
const mode = computed(() => appearanceStore.mode)

const statusText = computed(() => {
  if (mode.value === 'carousel') return '当前：轮播模式（每 15 秒自动切换）'
  if (mode.value === 'single') return '当前：单张背景'
  return '当前：默认主题'
})

async function loadImages() {
  images.value = await fetchBackgroundImages()
  console.log('images.value',images.value)
}

const beforeUpload = async (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning(`「${file.name}」不是图片文件`)
    return false
  }
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.warning(`「${file.name}」超过 50MB 限制`)
    return false
  }
  try {
    uploading.value = true
    // 原图直接上传，不做压缩
    const created = await uploadBackgroundImage(file)
    await loadImages()
    // 优先选中后端返回的新记录；拿不到 id 时按 url 匹配
    const matched = images.value.find(
      i => (created.id != null && i.id === created.id) || i.url === created.url
    )
    if (matched) selectedId.value = matched.id
  } catch {
    ElMessage.error(`「${file.name}」上传失败，请重试`)
  } finally {
    uploading.value = false
    emitBackgroundsChanged()
  }
  return false // 手动处理，阻止 el-upload 默认上传
}

async function removeImage(img) {
  try {
    await ElMessageBox.confirm('确定删除这张背景图吗？', '提示', { type: 'warning' })
  } catch {
    return // 用户取消
  }
  await deleteBackgroundImage(img.id)
  if (selectedId.value === img.id) selectedId.value = null
  // 单图模式下删的正是当前背景：恢复默认；轮播模式由 App.vue 监听到变更后自动处理
  if (mode.value !== 'carousel' && bgUrl.value === img.url) {
    appearanceStore.clearBg()
  }
  ElMessage.success('已删除')
  emitBackgroundsChanged()
  await loadImages()
}

function setAsBackground() {
  const img = images.value.find(i => i.id === selectedId.value)
  if (!img) {
    ElMessage.warning('请先选择一张图片')
    return
  }
  appearanceStore.setSingle(img.url)
  ElMessage.success('已设置为背景图')
}

function toggleCarousel() {
  if (mode.value === 'carousel') {
    appearanceStore.clearBg()
    ElMessage.success('已停止轮播，恢复默认主题')
    return
  }
  if (!images.value.length) {
    ElMessage.warning('请先上传图片')
    return
  }
  appearanceStore.enableCarousel()
  ElMessage.success('已开启背景轮播')
}

function resetTheme() {
  appearanceStore.clearBg()
  ElMessage.success('已恢复默认主题')
}

onMounted(loadImages)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* 瀑布流：纯 CSS columns，图片高度不一也能紧密排列 */
.masonry {
  column-width: 220px;
  column-gap: 14px;
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 14px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
  background: #f5f7fa;
}
.masonry-item.selected {
  border-color: var(--el-color-primary);
}
.thumb {
  width: 100%;
  display: block;
  cursor: zoom-in;
}
.thumb :deep(img) {
  display: block;
  width: 100%;
  height: auto;
}

/* 左上角选择圆圈 */
.pick-btn {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  padding: 0;
}
.masonry-item.selected .pick-btn {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

/* 右上角删除 */
.del-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(245, 108, 108, 0.9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  padding: 0;
}
.del-btn:hover {
  background: var(--el-color-danger);
}

.badge {
  position: absolute;
  left: 8px;
  bottom: 8px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}
</style>

<!-- 非 scoped：弹窗 teleport 到 body，scoped 样式无法命中 -->
<style>
/* 遮罩减淡，让背景图透过来被毛玻璃虚化 */
.appearance-dialog-mask {
  background-color: rgba(0, 0, 0, 0.25);
}
/* 弹窗本体与内容卡片同款毛玻璃，参数跟随外观设置 */
.appearance-dialog {
  background-color: rgba(255, 255, 255, var(--skin-panel-alpha, 0.45));
  backdrop-filter: blur(var(--skin-blur, 12px));
  -webkit-backdrop-filter: blur(var(--skin-blur, 12px));
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}
.appearance-dialog .el-dialog__header,
.appearance-dialog .el-dialog__body,
.appearance-dialog .el-dialog__footer {
  background: transparent;
}
.appearance-dialog .el-dialog__title {
  font-weight: 600;
}
</style>
