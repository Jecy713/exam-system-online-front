import request from './request'

export const studentApi = {
  // 学生进入考试
  enterExam(examId, data) {
    return request({
      url: `/student/exams/${examId}/enter`,
      method: 'post',
      data
    })
  },
  // 保存答案
  saveAnswer(examId, data) {
    return request({
      url: `/student/exams/${examId}/answers`,
      method: 'post',
      data
    })
  },
  // 提交考试
  submitExam(examId, data) {
    return request({
      url: `/student/exams/${examId}/submit`,
      method: 'post',
      data
    })
  }
}

