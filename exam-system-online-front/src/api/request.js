import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

/**
 * 是否启用本地 Mock 数据
 * - true: 所有接口都走本地模拟数据，不实际请求后端
 * - false: 正常请求后端接口
 *
 * 生产环境下应关闭 Mock，这里按照后端真实返回结构 Result<T> 做对齐。
 */
const USE_MOCK = false

/**
 * 本地 Mock 请求处理
 * 返回结构严格模拟后端 Result<T>：
 * { code: number, message: string, data: any }
 */
const mockExamStore = {
  list: []
}

const mockQuestionStore = {
  list: []
}

// 试卷题目映射：{ [examId]: ExamQuestionItemRequest[] with extra content }
const mockExamQuestions = {}

const mockStudentEnter = (examId, studentId) => {
  return {
    token: `token-${examId}-${studentId}-${Date.now()}`,
    message: '进入考试成功',
    participantId: Math.floor(Math.random() * 100000)
  }
}

const mockRequest = (config) => {
  const { url, method = 'get', data, params } = config

  const body = typeof data === 'string' ? (data ? JSON.parse(data) : {}) : (data || {})

  return new Promise((resolve) => {
    // 模拟网络延时
    setTimeout(() => {
      const m = method.toLowerCase()

      // 登录 -> Result<LoginResponse>
      if (url === '/auth/login' && m === 'post') {
        const role = body.userRole || 1 // 默认学生
        resolve({
          code: 200,
          message: '登录成功（Mock）',
          data: {
            userId: 1,
            username: body.username || 'mock-user',
            userRole: role
          }
        })
        return
      }

      // 注册 -> Result<LoginResponse>
      if (url === '/auth/register' && m === 'post') {
        const role = body.userRole || 1
        resolve({
          code: 200,
          message: '注册成功（Mock）',
          data: {
            userId: 2,
            username: body.username || 'new-user',
            userRole: role
          }
        })
        return
      }

      // 考试列表（分页） -> Result<List<ExamResponse>>
      if (url === '/exams/list' && m === 'get') {
        const page = Number(params?.page) || 1
        const size = Number(params?.size) || 20
        // 若为空则塞入少量示例
        if (mockExamStore.list.length === 0) {
          mockExamStore.list = Array.from({ length: 5 }).map((_, idx) => {
            const id = idx + 1
            return {
              id,
              examName: `示例考试-${id}`,
              examDescription: `这是第 ${id} 个示例考试`,
              examType: ((id % 4) + 1), // 1~4 对应 正式/模拟/自测/竞赛
              status: ((id % 4) + 1),   // 1~4 对应 未开始/进行中/已结束/已归档
              startTime: '2025-12-12 10:00:00',
              endTime: '2025-12-12 12:00:00',
              duration: 120
            }
          })
        }
        const start = (page - 1) * size
        const list = mockExamStore.list.slice(start, start + size)
        resolve({
          code: 200,
          message: '查询成功（Mock）',
          data: list
        })
        return
      }

      // 创建考试 -> Result<ExamResponse>
      if (url === '/exams/create' && m === 'post') {
        const newId = mockExamStore.list.length > 0 ? Math.max(...mockExamStore.list.map(i => i.id)) + 1 : 1
        const item = {
          id: newId,
          examName: body.examName,
          examDescription: body.examDescription || '',
          examType: body.examType,
          status: body.status,
          startTime: body.startTime,
          endTime: body.endTime,
          duration: body.duration
        }
        mockExamStore.list.unshift(item)
        resolve({
          code: 200,
          message: '创建考试成功（Mock）',
          data: item
        })
        return
      }

      // 更新考试（/exams/:id） -> Result<Void>
      if (url.startsWith('/exams/') && !url.endsWith('/status') && !url.endsWith('/questions') && m === 'put') {
        const examId = Number(url.split('/')[2])
        mockExamStore.list = mockExamStore.list.map(item => item.id === examId ? { ...item, ...body } : item)
        resolve({
          code: 200,
          message: '更新考试成功（Mock）',
          data: null
        })
        return
      }

      // 获取考试详情（只在 Mock 下简单返回）
      if (url.startsWith('/exams/') && m === 'get') {
        const examId = Number(url.split('/')[2])
        const item = mockExamStore.list.find(i => i.id === examId)
        resolve({
          code: item ? 200 : 404,
          message: item ? '查询成功（Mock）' : '未找到考试（Mock）',
          data: item || null
        })
        return
      }

      // 更新考试状态（/exams/:id/status） -> Result<Void>
      if (url.endsWith('/status') && m === 'put') {
        const examId = Number(url.split('/')[2])
        mockExamStore.list = mockExamStore.list.map(item => item.id === examId ? { ...item, status: body.status, startTime: body.startTime || item.startTime, endTime: body.endTime || item.endTime } : item)
        resolve({
          code: 200,
          message: '更新考试状态成功（Mock）',
          data: null
        })
        return
      }

      // 考试添加题目（/exams/:id/questions） -> Result<Void>
      if (url.endsWith('/questions') && m === 'post') {
        const examId = Number(url.split('/')[2])
        const items = body.items || []
        // 将题目信息落入 mockExamQuestions，方便学生端读取
        const enriched = items.map((item, idx) => {
          const q = mockQuestionStore.list.find(q => q.id === item.questionId)
          return {
            questionId: item.questionId,
            questionScore: item.questionScore || 1,
            sortOrder: item.sortOrder || idx + 1,
            groupId: item.groupId || 1,
            questionContent: q?.questionContent || '',
            questionCategory: q?.questionCategory,
            questionOptions: q?.questionOptions,
            questionAnswer: q?.questionAnswer,
            questionTags: q?.questionTags
          }
        })
        mockExamQuestions[examId] = enriched
        resolve({
          code: 200,
          message: '添加题目成功（Mock）',
          data: null
        })
        return
      }

      // 获取考试题目列表
      if (url.startsWith('/exams/') && url.endsWith('/questions') && m === 'get') {
        const examId = Number(url.split('/')[2])
        const list = mockExamQuestions[examId] || []
        resolve({
          code: 200,
          message: '查询成功（Mock）',
          data: list
        })
        return
      }

      // 学生进入考试
      if (url.includes('/student/exams/') && url.endsWith('/enter') && m === 'post') {
        const examId = Number(url.split('/')[3])
        const result = mockStudentEnter(examId, body.studentId || 0)
        resolve({
          code: 200,
          message: '进入考试成功（Mock）',
          data: result
        })
        return
      }

      // 学生保存答案
      if (url.includes('/student/exams/') && url.endsWith('/answers') && m === 'post') {
        resolve({
          code: 200,
          message: '答题记录已保存（Mock）',
          data: null
        })
        return
      }

      // 学生提交考试
      if (url.includes('/student/exams/') && url.endsWith('/submit') && m === 'post') {
        resolve({
          code: 200,
          message: '考试提交成功（Mock）',
          data: null
        })
        return
      }

      // 根据标签搜索题目 -> Result<List<QuestionResponse>>
      if (url === '/questions/search-by-tag' && m === 'get') {
        const tag = params?.tag || '默认标签'
        // 若本地还没有数据，先初始化一批示例题目
        if (mockQuestionStore.list.length === 0) {
          mockQuestionStore.list = [
            {
              id: 1,
              questionCategory: 1,
              questionContent: `【${tag}】单选题示例 1`,
              questionOptions: '["选项A","选项B","选项C","选项D"]',
              questionAnswer: 'A',
              questionTags: tag
            },
            {
              id: 2,
              questionCategory: 2,
              questionContent: `【${tag}】多选题示例 2`,
              questionOptions: '["选项A","选项B","选项C","选项D"]',
              questionAnswer: 'A,C',
              questionTags: tag
            },
            {
              id: 3,
              questionCategory: 3,
              questionContent: `【${tag}】判断题示例 3`,
              questionOptions: '["正确","错误"]',
              questionAnswer: '正确',
              questionTags: tag
            }
          ]
        }
        const list = mockQuestionStore.list.filter(q => (q.questionTags || '').includes(tag))
        resolve({
          code: 200,
          message: '查询成功（Mock）',
          data: list
        })
        return
      }

      // 题目列表（分页，支持 keyword 过滤）-> Result<List<QuestionResponse>>
      if (url === '/questions/list' && m === 'get') {
        const page = Number(params?.page) || 1
        const size = Number(params?.size) || 20
        const keyword = (params?.keyword || '').toLowerCase()
        if (mockQuestionStore.list.length === 0) {
          mockQuestionStore.list = [
            {
              id: 1,
              questionCategory: 1,
              questionContent: `【示例】单选题示例 1`,
              questionOptions: '["选项A","选项B","选项C","选项D"]',
              questionAnswer: 'A',
              questionTags: '示例'
            }
          ]
        }
        let list = mockQuestionStore.list
        if (keyword) {
          list = list.filter(q => {
            return (
              String(q.id || '').includes(keyword) ||
              (q.questionContent || '').toLowerCase().includes(keyword) ||
              (q.questionTags || '').toLowerCase().includes(keyword)
            )
          })
        }
        const start = (page - 1) * size
        list = list.slice(start, start + size)
        resolve({
          code: 200,
          message: '查询成功（Mock）',
          data: list
        })
        return
      }

      // 创建题目 -> Result<QuestionResponse>
      if (url === '/questions/create' && m === 'post') {
        const newId = mockQuestionStore.list.length > 0 ? Math.max(...mockQuestionStore.list.map(i => i.id)) + 1 : 1
        const item = {
          id: newId,
          questionCategory: body.questionCategory,
          questionContent: body.questionContent,
          questionOptions: body.questionOptions || '',
          questionAnswer: body.questionAnswer,
          questionTags: body.questionTags
        }
        mockQuestionStore.list.unshift(item)
        resolve({
          code: 200,
          message: '创建题目成功（Mock）',
          data: item
        })
        return
      }

      // 更新题目 -> Result<QuestionResponse>
      if (url === '/questions/update' && m === 'put') {
        mockQuestionStore.list = mockQuestionStore.list.map(item =>
          item.id === body.id ? { ...item, ...body } : item
        )
        resolve({
          code: 200,
          message: '更新题目成功（Mock）',
          data: {
            id: body.id,
            questionCategory: body.questionCategory,
            questionContent: body.questionContent,
            questionOptions: body.questionOptions,
            questionAnswer: body.questionAnswer,
            questionTags: body.questionTags
          }
        })
        return
      }

      // 默认兜底：方便调试
      resolve({
        code: 200,
        message: '通用 Mock 响应（未匹配到特定规则）',
        data: {
          mock: true,
          url,
          method: m,
          body,
          params
        }
      })
    }, 300)
  })
}

// 实际 axios 实例（当 USE_MOCK 为 false 时使用）
const realRequest = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
realRequest.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
realRequest.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
        ElMessage.error('登录已过期，请重新登录')
      } else {
        ElMessage.error(data?.message || data || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

// 根据开关导出不同实现
const request = USE_MOCK ? mockRequest : realRequest

export default request

