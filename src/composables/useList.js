// composables/useList.js
import { reactive, ref } from 'vue'

/**
 * useList(fetcher, initialQuery)
 * @param {(params: object) => Promise} fetcher 列表请求函数（由 api 模块提供），接收组装好的查询参数
 * @param {object} initialQuery 可选初始参数
 * @returns {object} { query, data, total, loading, fetch, resetQuery }
 */
export function useList(fetcher, initialQuery = {}) {
  const query = reactive({
    page: 1,
    pageSize: 10,
    searchText: '',
    conditions: {},
    sortField: '',
    sortDesc: false,
    ...initialQuery
  })

  const data = reactive({
    items: [],
    total: 0
  })

  const loading = ref(false)

  const fetch = async (extraParams = {}) => {
    loading.value = true
    try {
      const params = {
        page: query.page,
        pageSize: query.pageSize,
        search: query.searchText,
        sortField: query.sortField,
        sortDesc: query.sortDesc,
        conditions: query.conditions,
        ...extraParams
      }

      const res = await fetcher(params)

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
    fetch,
    resetQuery
  }
}
