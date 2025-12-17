<template>
  <div class="exam-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>编辑考试</h2>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="form.examName" placeholder="请输入考试名称" />
        </el-form-item>
        
        <el-form-item label="考试描述" prop="examDescription">
          <el-input
            v-model="form.examDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入考试描述"
          />
        </el-form-item>
        
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="form.examType" placeholder="请选择考试类型">
            <!-- 对应 exams.exam_type：1：正式 2：模拟 3：自测 4：竞赛 -->
            <el-option label="正式考试" :value="1" />
            <el-option label="模拟考试" :value="2" />
            <el-option label="自测考试" :value="3" />
            <el-option label="竞赛考试" :value="4" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="考试状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="未开始" :value="1" />
            <el-option label="进行中" :value="2" />
            <el-option label="已结束" :value="3" />
            <el-option label="已归档" :value="4" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="考试时长(分钟)" prop="duration">
          <el-input-number
            v-model="form.duration"
            :min="1"
            placeholder="请输入考试时长"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            更新
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="question-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>试题配置</h3>
          <div style="display:flex;gap:10px;">
            <el-button type="primary" size="small" @click="openSelectDialog">
              选择已有题目
            </el-button>
            <el-button type="success" size="small" @click="openCreateDialog">
              新建题目
            </el-button>
            <el-button type="warning" size="small" @click="saveQuestions" :loading="savingQuestions">
              保存到试卷
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="selectedItems" style="width: 100%;" v-loading="savingQuestions">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="题目ID" prop="questionId" width="100" />
        <el-table-column label="题目内容">
          <template #default="{ row }">
            {{ row.questionContent }}
          </template>
        </el-table-column>
        <el-table-column label="题型" width="100">
          <template #default="{ row }">
            {{ getQuestionTypeName(row.questionCategory) }}
          </template>
        </el-table-column>
        <el-table-column label="分数" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.questionScore" :min="1" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="120">
          <template #default="{ row, $index }">
            <el-input-number v-model="row.sortOrder" :min="1" :max="999" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="组别" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.groupId" :min="1" :max="10" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" size="small" text @click="removeSelected(row.questionId)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="selectedItems.length === 0" description="请先选择题目或新建题目" />
    </el-card>

    <!-- 选择题目对话框 -->
    <el-dialog v-model="selectDialogVisible" title="选择已有题目" width="80%">
      <el-input v-model="questionSearch" placeholder="按题目内容/标签搜索" style="margin-bottom: 10px;" clearable @keyup.enter="loadQuestions" />
      <el-table :data="questionList" height="400" @selection-change="handleSelectChange" ref="selectTableRef">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="questionCategory" label="题型" width="100">
          <template #default="{ row }">{{ getQuestionTypeName(row.questionCategory) }}</template>
        </el-table-column>
        <el-table-column prop="questionContent" label="题目内容" />
        <el-table-column prop="questionTags" label="标签" width="160" />
      </el-table>
      <template #footer>
        <el-button @click="selectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelect">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新建题目对话框 -->
    <el-dialog v-model="createDialogVisible" title="新建题目" width="600px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px">
        <el-form-item label="题型" prop="questionCategory">
          <el-select v-model="createForm.questionCategory" placeholder="请选择题型">
            <el-option label="单选题" :value="1" />
            <el-option label="多选题" :value="2" />
            <el-option label="判断题" :value="3" />
            <el-option label="填空题" :value="4" />
            <el-option label="简答题" :value="5" />
            <el-option label="编程题" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目内容" prop="questionContent">
          <el-input v-model="createForm.questionContent" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="选项" prop="questionOptions">
          <el-input v-model="createForm.questionOptions" type="textarea" :rows="3" placeholder='可填 JSON 数组，如 ["A","B"]，非选择题可空' />
        </el-form-item>
        <el-form-item label="答案" prop="questionAnswer">
          <el-input v-model="createForm.questionAnswer" />
        </el-form-item>
        <el-form-item label="标签" prop="questionTags">
          <el-input v-model="createForm.questionTags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateQuestion">保存并加入试卷</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { examApi } from '@/api/exam'
import { questionApi } from '@/api/question'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)
const examId = ref(route.params.id)
const savingQuestions = ref(false)
const selectDialogVisible = ref(false)
const createDialogVisible = ref(false)
const questionList = ref([])
const questionSearch = ref('')
const selectedItems = ref([])
const selectedQuestionIds = ref([])
const selectTableRef = ref()
const creating = ref(false)
const createFormRef = ref()
const createForm = reactive({
  questionCategory: null,
  questionContent: '',
  questionOptions: '',
  questionAnswer: '',
  questionTags: ''
})

const form = reactive({
  examName: '',
  examDescription: '',
  examType: null,
  status: null,
  startTime: '',
  endTime: '',
  duration: null
})

const rules = {
  duration: [
    { type: 'number', min: 1, message: '考试时长必须大于0', trigger: 'blur' }
  ]
}

const createRules = {
  questionCategory: [{ required: true, message: '请选择题型', trigger: 'change' }],
  questionContent: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  questionAnswer: [{ required: true, message: '请输入答案', trigger: 'blur' }],
  questionTags: [{ required: true, message: '请输入标签', trigger: 'blur' }]
}

const loadDetail = async () => {
  try {
    const res = await examApi.getExamDetail(examId.value)
    if (res?.data) {
      Object.assign(form, res.data)
    }
  } catch (error) {
    // 后端可能未实现详情接口，忽略
  }
}

const loadQuestions = async () => {
  try {
    const res = await questionApi.listQuestions(1, 100, questionSearch.value)
    questionList.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.response?.data || '加载题目失败')
  }
}

const openSelectDialog = () => {
  selectDialogVisible.value = true
  loadQuestions()
}

const handleSelectChange = (rows) => {
  selectedQuestionIds.value = rows.map(r => r.id)
}

const confirmSelect = () => {
  const rows = questionList.value.filter(q => selectedQuestionIds.value.includes(q.id))
  const existingIds = new Set(selectedItems.value.map(i => i.questionId))
  rows.forEach((q, idx) => {
    if (!existingIds.has(q.id)) {
      selectedItems.value.push({
        questionId: q.id,
        questionContent: q.questionContent,
        questionScore: 1,
        sortOrder: selectedItems.value.length + idx + 1,
        groupId: 1
      })
    }
  })
  selectDialogVisible.value = false
}

const removeSelected = (questionId) => {
  selectedItems.value = selectedItems.value.filter(i => i.questionId !== questionId)
}

const openCreateDialog = () => {
  createForm.questionCategory = null
  createForm.questionContent = ''
  createForm.questionOptions = ''
  createForm.questionAnswer = ''
  createForm.questionTags = ''
  createDialogVisible.value = true
}

const handleCreateQuestion = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    creating.value = true
    try {
      const res = await questionApi.createQuestion(createForm)
      if (res?.data) {
        const q = res.data
        selectedItems.value.push({
          questionId: q.id,
          questionContent: q.questionContent,
          questionScore: 1,
          sortOrder: selectedItems.value.length + 1,
          groupId: 1
        })
        ElMessage.success('创建题目成功并已加入试卷')
        createDialogVisible.value = false
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.message || error.response?.data || '创建题目失败')
    } finally {
      creating.value = false
    }
  })
}

const saveQuestions = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择题目')
    return
  }
  savingQuestions.value = true
  try {
    const payload = {
      items: selectedItems.value.map((item, idx) => ({
        questionId: item.questionId,
        questionScore: item.questionScore || 1,
        sortOrder: item.sortOrder || idx + 1,
        groupId: item.groupId || 1
      }))
    }
    await examApi.addQuestions(examId.value, payload)
    ElMessage.success('试题已保存到试卷')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.response?.data || '保存试题失败')
  } finally {
    savingQuestions.value = false
  }
}

onMounted(() => {
  loadDetail()
})

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await examApi.updateExam(examId.value, form)
        ElMessage.success('更新考试成功')
        router.push('/exams')
      } catch (error) {
        ElMessage.error(error.response?.data || '更新失败')
      } finally {
        loading.value = false
      }
    }
  })
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
</script>

<style scoped>
.exam-edit {
  padding: 0;
}

.card-header h2 {
  margin: 0;
}
</style>

