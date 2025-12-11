import request from './request'

export const examApi = {
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
  }
}

