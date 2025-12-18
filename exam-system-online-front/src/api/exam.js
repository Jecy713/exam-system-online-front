import request from './request'

export const examApi = {
  // 分页查询考试列表
  listExams(params = {}) {
    const { page = 1, size = 20 } = params
    return request({
      url: '/exams/list',
      method: 'get',
      params: { page, size }
    })
  },

  // 获取考试详情（目前后端未提供 Controller，预留占位）
  getExamDetail(examId) {
    return request({
      url: `/exams/${examId}`,
      method: 'get'
    })
  },

  // 获取考试题目列表（目前后端未提供 Controller，预留占位）
  getExamQuestions(examId) {
    return request({
      // 对应后端 GET /api/exams/{examId}/questions/detail
      // 返回 ExamRandomGenerateResponse，包含 questions 列表
      url: `/exams/${examId}/questions/detail`,
      method: 'get'
    })
  },
  
  // 创建考试
  createExam(data) {
    return request({
      url: '/exams/create',
      method: 'post',
      data
    })
  },
  
  // 更新考试
  updateExam(examId, data) {
    return request({
      url: `/exams/${examId}`,
      method: 'put',
      data
    })
  },
  
  // 更新考试状态
  updateExamStatus(examId, data) {
    return request({
      url: `/exams/${examId}/status`,
      method: 'put',
      data
    })
  },
  
  // 添加题目到考试
  addQuestions(examId, data) {
    return request({
      url: `/exams/${examId}/questions`,
      method: 'post',
      data
    })
  },

  // 随机智能组卷（使用后端 /api/exams/{examId}/questions/random-generate）
  randomGenerateQuestions(examId, data) {
    return request({
      url: `/exams/${examId}/questions/random-generate`,
      method: 'post',
      data
    })
  }
}

