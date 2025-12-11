import request from './request'

export const questionApi = {
  // 根据标签搜索题目
  searchByTag(tag, page = 1) {
    return request({
      url: '/questions/search-by-tag',
      method: 'get',
      params: { tag, page }
    })
  },
  
  // 创建题目
  createQuestion(data) {
    return request({
      url: '/questions/create',
      method: 'post',
      data
    })
  },
  
  // 更新题目
  updateQuestion(data) {
    return request({
      url: '/questions/update',
      method: 'put',
      data
    })
  }
}

