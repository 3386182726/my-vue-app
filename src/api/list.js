// api/list.js
import api from './api' // axios 实例
import { reactive, ref } from 'vue'

/**
 * api.getList(url, initialQuery)
 * @param {string} url 接口地址
 * @param {object} initialQuery 可选初始参数
 * @returns {object} { query, data, total, loading, getList, resetQuery }
 */
export function getList(url, initialQuery = {}) {
  const query = reactive({
    page: 1,
    pageSize: 10,
    searchText: '',
    sortField: '',
    sortDesc: false,
    ...initialQuery
  })

  const data = reactive({
    items: [],
    total: 0
  })

  const loading = ref(false)

  const getList = async (extraParams = {}) => {
    loading.value = true
    try {
      const params = {
        page: query.page,
        pageSize: query.pageSize,
        search: query.searchText,
        sortField: query.sortField,
        sortDesc: query.sortDesc,
        ...extraParams
      }

      const res = await api.get(url, { params })

      data.items = res.data.items
      data.total = res.data.total
    } finally {
      loading.value = false
    }
  }

  const resetQuery = () => {
    query.page = 1
    query.pageSize = 10
    query.searchText = ''
    query.sortField = ''
    query.sortDesc = false
  }

  return {
    query,
    data,
    loading,
    getList,
    resetQuery
  }
}