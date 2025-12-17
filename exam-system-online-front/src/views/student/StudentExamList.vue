<template>
  <div class="student-exam-list">
    <div class="header-actions">
      <h2>考试大厅</h2>
      <el-input
        v-model="searchKeyword"
        placeholder="输入关键词搜索（名称/描述/类型/状态）"
        style="width: 320px"
        clearable
        @keyup.enter="loadExams"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-card>
      <el-table :data="filteredExams" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="examName" label="考试名称" />
        <el-table-column prop="examDescription" label="描述" show-overflow-tooltip />
        <el-table-column prop="examType" label="类型" width="120">
          <template #default="{ row }">
            {{ getExamTypeName(row.examType) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(分钟)" width="120" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEnter(row)" :loading="enteringId === row.id">
              进入考试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="enterDialogVisible" title="进入考试成功" width="480px">
      <p>考试：{{ enterResult?.examName }}</p>
      <p>Token：{{ enterResult?.token }}</p>
      <p>参与记录ID：{{ enterResult?.participantId }}</p>
      <p>提示：{{ enterResult?.message }}</p>
      <template #footer>
        <el-button type="primary" @click="enterDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { Search } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { examApi } from '@/api/exam'
import { studentApi } from '@/api/student'

const loading = ref(false)
const examList = ref([])
const searchKeyword = ref('')
const enteringId = ref(null)
const enterDialogVisible = ref(false)
const enterResult = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)

const authStore = useAuthStore()
const router = useRouter()

const getExamTypeName = (type) => {
  const types = { 1: '正式考试', 2: '模拟考试', 3: '自测考试', 4: '竞赛考试' }
  return types[type] || '未知'
}

const getStatusName = (status) => {
  const statuses = { 1: '未开始', 2: '进行中', 3: '已结束', 4: '已归档' }
  return statuses[status] || '未知'
}

const getStatusType = (status) => {
  const types = { 1: 'info', 2: 'success', 3: 'warning', 4: '' }
  return types[status] || ''
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

const filteredExams = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return examList.value
  return examList.value.filter((row) => {
    const texts = [
      String(row.id || ''),
      row.examName || '',
      row.examDescription || '',
      getExamTypeName(row.examType || ''),
      getStatusName(row.status || ''),
      row.startTime || '',
      row.endTime || ''
    ].join(' ').toLowerCase()
    return texts.includes(kw)
  })
})

const loadExams = async () => {
  loading.value = true
  try {
    const res = await examApi.listExams({ page: currentPage.value, size: pageSize.value })
    const list = Array.isArray(res?.data) ? res.data : []
    examList.value = list
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.response?.data || '加载考试列表失败')
    examList.value = []
  } finally {
    loading.value = false
  }
}

const handleEnter = async (row) => {
  // 仅进行中才允许进入
  if (row.status !== 2) {
    ElMessage.warning('当前考试未处于进行中，暂不可进入')
    return
  }
  enteringId.value = row.id
  try {
    const studentId = authStore.userInfo?.userId
    if (!studentId) {
      ElMessage.error('未获取到学生ID，请重新登录')
      return
    }
    const res = await studentApi.enterExam(row.id, { studentId })
    if (res.code !== 200 || !res.data) {
      throw new Error(res.message || '进入考试失败')
    }
    enterResult.value = {
      examName: row.examName,
      token: res.data.token,
      participantId: res.data.participantId,
      message: res.data.message
    }
    ElMessage.success(res.message || '进入考试成功')
    // 使用 history 路由跳转到答题页面
    router.push(`/student/exams/${row.id}/take`)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.response?.data || error.message || '进入考试失败')
  } finally {
    enteringId.value = null
  }
}

onMounted(() => {
  loadExams()
})
</script>

<style scoped>
.student-exam-list {
  padding: 0;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-actions h2 {
  margin: 0;
}
</style>

