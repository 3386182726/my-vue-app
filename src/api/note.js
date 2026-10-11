import request from './request'

// 接口路径常量（模块内部使用）
const NOTE_API = '/api/note'
const NOTE_CATEGORY_API = '/api/note/noteCategory'

// 文章分页列表
export const fetchNotes = (params) => request.get(NOTE_API, { params })

// 文章详情
export const fetchNoteById = (id) => request.get(`${NOTE_API}/${id}`)

// 新增/保存文章
export const saveNote = (data) => request.post(NOTE_API, data)

// 删除文章
export const deleteNote = (id) => request.delete(`${NOTE_API}/${id}`)

// 全部分类（下拉选择用）
export const fetchNoteCategories = () => request.get(`${NOTE_CATEGORY_API}/all`)

// 文章分类分页列表
export const fetchNoteCategoryList = (params) => request.get(NOTE_CATEGORY_API, { params })

// 新增/保存文章分类
export const saveNoteCategory = (data) => request.post(NOTE_CATEGORY_API, data)

// 删除文章分类
export const deleteNoteCategory = (id) => request.delete(`${NOTE_CATEGORY_API}/${id}`)
