<template>
  <div class="student-exam-take">
    <el-card class="exam-header">
      <div class="exam-title-row">
        <h2>{{ exam?.examName || '考试答题' }}</h2>
        <div class="exam-meta">
          <span>类型：{{ getExamTypeName(exam?.examType) }}</span>
          <span>时长：{{ exam?.duration || '-' }} 分钟</span>
        </div>
      </div>
      <div class="exam-desc">
        {{ exam?.examDescription || '请认真完成本次考试' }}
      </div>
    </el-card>

    <el-card class="questions-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>试题列表</span>
          <el-button type="primary" size="small" @click="handleSubmit" :loading="submitting">
            提交试卷
          </el-button>
        </div>
      </template>

      <el-empty v-if="questions.length === 0" description="暂未加载到试题" />

      <div v-else class="question-list">
        <div
          v-for="(q, index) in questions"
          :key="q.id || index"
          class="question-item"
        >
          <div class="question-header">
            <span class="question-index">第 {{ index + 1 }} 题</span>
            <span class="question-type">{{ getQuestionTypeName(q.questionCategory) }}</span>
          </div>

          <div class="question-content">
            {{ q.questionContent }}
          </div>

          <!-- 单选题 -->
          <ul
            v-if="q.questionCategory === 1 && renderOptions(q).length"
            class="question-options"
          >
            <li
              v-for="opt in renderOptions(q)"
              :key="opt.value"
              :class="['option-item', { active: answers[index + 1] === opt.value }]"
              @click="handleSelectSingle(index + 1, opt.value)"
            >
              <span class="option-label">{{ opt.label }}.</span>
              <span class="option-text">{{ opt.text }}</span>
            </li>
          </ul>

          <!-- 多选题 -->
          <ul
            v-else-if="q.questionCategory === 2 && renderOptions(q).length"
            class="question-options multi"
          >
            <li
              v-for="opt in renderOptions(q)"
              :key="opt.value"
              :class="['option-item', { active: (answersMulti[index + 1] || []).includes(opt.value) }]"
              @click="handleToggleMulti(index + 1, opt.value)"
            >
              <span class="option-label">{{ opt.label }}.</span>
              <span class="option-text">{{ opt.text }}</span>
            </li>
          </ul>

          <!-- 判断题 -->
          <div v-else-if="q.questionCategory === 3" class="judge-actions">
            <el-button
              :type="answers[index + 1] === '正确' ? 'primary' : 'default'"
              @click="handleSelectJudge(index + 1, '正确')"
            >
              正确
            </el-button>
            <el-button
              :type="answers[index + 1] === '错误' ? 'primary' : 'default'"
              @click="handleSelectJudge(index + 1, '错误')"
            >
              错误
            </el-button>
          </div>

          <!-- 其余题型（填空/简答/编程）用文本框 -->
          <div v-else class="question-answer-input">
            <el-input
              type="textarea"
              :rows="q.questionCategory === 6 ? 8 : 4"
              v-model="answersText[index + 1]"
              :placeholder="getTextareaPlaceholder(q.questionCategory)"
              @change="handleTextAnswerChange(index + 1)"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { examApi } from '@/api/exam'
import { studentApi } from '@/api/student'

const route = useRoute()
const authStore = useAuthStore()

const examId = Number(route.params.examId)
const exam = ref(null)
const questions = ref([])
const answers = reactive({})
const answersMulti = reactive({})
const answersText = reactive({})
const loading = ref(false)
const submitting = ref(false)
const hasSubmitted = ref(false)

const getExamTypeName = (type) => {
  const types = { 1: '正式考试', 2: '模拟考试', 3: '自测考试', 4: '竞赛考试' }
  return types[type] || '未知'
}

const getQuestionTypeName = (category) => {
  const map = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '填空题',
    5: '简答题',
    6: '编程题'
  }
  return map[category] || '未知题型'
}

const renderOptions = (q) => {
  if (!q.questionOptions) return []
  try {
    const parsed = JSON.parse(q.questionOptions)
    if (Array.isArray(parsed)) {
      const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      return parsed.map((text, idx) => ({
        label: labels[idx] || String(idx + 1),
        value: labels[idx] || String(idx + 1),
        text
      }))
    }
  } catch (e) {
    // ignore parse error
  }
  return []
}

const getTextareaPlaceholder = (category) => {
  if (category === 6) return '请输入代码或思路（编程题）'
  if (category === 5) return '请输入简答题答案'
  if (category === 4) return '请输入填空题答案'
  return '请输入答案'
}

const loadData = async () => {
  loading.value = true
  try {
    // 先获取考试基础信息（名称、类型、时长等）
    const examRes = await examApi.getExamDetail(examId)
    if (examRes?.data) {
      exam.value = examRes.data
    }

    // 获取当前考试下的所有试卷题目（必须进入考试后才能进入本页面）
    const examQuestionsRes = await examApi.getExamQuestions(examId)
    if (!examQuestionsRes || examQuestionsRes.code !== 200 || !examQuestionsRes.data) {
      throw new Error(examQuestionsRes?.message || '加载试卷题目失败')
    }

    // examQuestionsRes.data 结构为 ExamRandomGenerateResponse：{ questions, totalCount, totalScore }
    const list = Array.isArray(examQuestionsRes.data.questions) ? examQuestionsRes.data.questions : []
    questions.value = list
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.response?.data || '加载考试数据失败')
  } finally {
    loading.value = false
  }
}

const saveAnswer = async (sortOrder, answerValue) => {
  const studentId = authStore.userInfo?.userId
  if (!studentId) {
    ElMessage.error('未获取到学生ID，请重新登录')
    return
  }
  try {
    await studentApi.saveAnswer(examId, {
      studentId,
      sortOrder,
      answer: answerValue
    })
  } catch (error) {
    // 不打断答题，只提示
    ElMessage.error(error.response?.data?.message || error.response?.data || '保存答案失败')
  }
}

// 单选
const handleSelectSingle = (sortOrder, value) => {
  answers[sortOrder] = value
  answersText[sortOrder] = value
  saveAnswer(sortOrder, value)
}

// 多选
const handleToggleMulti = (sortOrder, value) => {
  const current = answersMulti[sortOrder] ? [...answersMulti[sortOrder]] : []
  const idx = current.indexOf(value)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(value)
  }
  answersMulti[sortOrder] = current
  answers[sortOrder] = current
  saveAnswer(sortOrder, current)
}

// 判断
const handleSelectJudge = (sortOrder, value) => {
  answers[sortOrder] = value
  answersText[sortOrder] = value
  saveAnswer(sortOrder, value)
}

// 文本题（填空/简答/编程）
const handleTextAnswerChange = (sortOrder) => {
  const value = answersText[sortOrder] || ''
  answers[sortOrder] = value
  saveAnswer(sortOrder, value)
}

const handleSubmit = async () => {
  const studentId = authStore.userInfo?.userId
  if (!studentId) {
    ElMessage.error('未获取到学生ID，请重新登录')
    return
  }
  try {
    await ElMessageBox.confirm('确定要提交试卷吗？提交后将无法修改答案。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    const res = await studentApi.submitExam(examId, { studentId })
    if (res.code === 200) {
      ElMessage.success(res.message || '提交成功')
      hasSubmitted.value = true
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.response?.data || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 强制收卷：用于考生执意离开页面时，尽量将当前答案提交到后端
const forceSubmit = async () => {
  if (hasSubmitted.value) return
  const studentId = authStore.userInfo?.userId
  if (!studentId) return
  try {
    await studentApi.submitExam(examId, { studentId })
    hasSubmitted.value = true
  } catch (_) {
    // 强制收卷失败时不再打断离开流程，答案可能依赖后端缓冲机制
  }
}

onMounted(() => {
  loadData()
})

// 防止考生在未提交试卷前随意关闭/刷新页面
const beforeUnloadHandler = (event) => {
  if (hasSubmitted.value) return

  // 尝试使用 sendBeacon 在关闭页面前强制收卷（部分浏览器支持）
  const studentId = authStore.userInfo?.userId
  if (studentId && navigator.sendBeacon) {
    const payload = JSON.stringify({ studentId })
    const blob = new Blob([payload], { type: 'application/json' })
    navigator.sendBeacon(`/api/student/exams/${examId}/submit`, blob)
  }

  event.preventDefault()
  event.returnValue = '当前考试尚未提交，离开页面可能导致答题记录丢失，确定要离开吗？'
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})

// 防止在 SPA 内部路由跳转时误离开考试页面
onBeforeRouteLeave((to, from, next) => {
  if (hasSubmitted.value) {
    next()
    return
  }
  ElMessageBox.confirm(
    '当前考试尚未提交，离开页面可能导致答题记录丢失，确定要离开吗？',
    '提示',
    {
      confirmButtonText: '确定离开',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      // 用户执意离开时，先尝试强制收卷，再跳转
      await forceSubmit()
      next()
    })
    .catch(() => {
      next(false)
    })
})
</script>

<style scoped>
.student-exam-take {
  padding: 0;
}
.exam-header {
  margin-bottom: 20px;
}
.exam-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.exam-meta {
  display: flex;
  gap: 16px;
  color: #909399;
}
.exam-desc {
  margin-top: 10px;
  color: #606266;
}
.questions-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.question-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.question-index {
  font-weight: 600;
}
.question-type {
  font-size: 13px;
  color: #909399;
}
.question-content {
  margin-bottom: 8px;
}
.question-options {
  list-style: none;
  padding: 0;
  margin: 0;
}
.option-item {
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.option-item:hover {
  background: #f5f7fa;
}
.option-item.active {
  background: #ecf5ff;
  color: #409eff;
}
.option-label {
  font-weight: 600;
}
.question-answer-input {
  margin-top: 8px;
}
</style>


