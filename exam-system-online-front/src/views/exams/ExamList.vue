<template>
  <div class="exam-list">
    <div class="header-actions">
      <h2>考试管理</h2>
      <div style="display: flex; gap: 10px; align-items: center;">
        <el-input
          v-model="searchKeyword"
          placeholder="输入关键词搜索（名称/描述/类型/状态）"
          style="width: 300px"
          clearable
        />
        <el-button type="primary" @click="$router.push('/exams/create')">
          <el-icon><Plus /></el-icon>
          创建考试
        </el-button>
      </div>
    </div>
    
    <el-card>
      <el-table :data="filteredExams" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="examName" label="考试名称" />
        <el-table-column prop="examDescription" label="描述" show-overflow-tooltip />
        <el-table-column prop="examType" label="类型" width="100">
          <template #default="{ row }">
            {{ getExamTypeName(row.examType) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleUpdateStatus(row)">
              更新状态
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 更新状态对话框 -->
    <el-dialog v-model="statusDialogVisible" title="更新考试状态" width="500px">
      <el-form :model="statusForm" label-width="120px">
        <el-form-item label="用户角色">
          <el-select v-model="statusForm.userRole" placeholder="请选择角色">
            <el-option label="教师" :value="2" />
            <el-option label="管理员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试状态">
          <el-select v-model="statusForm.status" placeholder="请选择状态">
            <el-option label="未开始" :value="1" />
            <el-option label="进行中" :value="2" />
            <el-option label="已结束" :value="3" />
            <el-option label="已归档" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="statusForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="statusForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { examApi } from '@/api/exam'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const examList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const statusDialogVisible = ref(false)
const currentExamId = ref(null)

const statusForm = ref({
  userRole: null,
  status: null,
  startTime: '',
  endTime: ''
})

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
    // 后端返回 Result<List<ExamResponse>>
    const list = Array.isArray(res?.data) ? res.data : []
    examList.value = list
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.response?.data || '加载考试列表失败')
    examList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadExams()
})

const getExamTypeName = (type) => {
  // 对应 exams.exam_type：1：正式 2：模拟 3：自测 4：竞赛
  const types = {
    1: '正式考试',
    2: '模拟考试',
    3: '自测考试',
    4: '竞赛考试'
  }
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

const handleEdit = (row) => {
  router.push(`/exams/${row.id}/edit`)
}

const handleUpdateStatus = (row) => {
  currentExamId.value = row.id
  statusForm.value = {
    userRole: null,
    status: row.status,
    startTime: row.startTime,
    endTime: row.endTime
  }
  statusDialogVisible.value = true
}

const handleSubmitStatus = async () => {
  try {
    await examApi.updateExamStatus(currentExamId.value, statusForm.value)
    ElMessage.success('更新考试状态成功')
    statusDialogVisible.value = false
    loadExams()
  } catch (error) {
    ElMessage.error(error.response?.data || '更新失败')
  }
}
</script>

<style scoped>
.exam-list {
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

