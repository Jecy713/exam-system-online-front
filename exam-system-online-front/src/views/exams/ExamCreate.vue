<template>
  <div class="exam-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>创建考试</h2>
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
        
        <el-form-item label="创建者ID" prop="creatorId">
          <el-input-number
            v-model="form.creatorId"
            :min="1"
            placeholder="请输入创建者ID"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            创建
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { examApi } from '@/api/exam'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  examName: '',
  examDescription: '',
  examType: null,
  status: null,
  startTime: '',
  endTime: '',
  duration: null,
  creatorId: authStore.userInfo?.userId || null
})

const rules = {
  examName: [
    { required: true, message: '请输入考试名称', trigger: 'blur' }
  ],
  examType: [
    { required: true, message: '请选择考试类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择考试状态', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入考试时长', trigger: 'blur' },
    { type: 'number', min: 1, message: '考试时长必须大于0', trigger: 'blur' }
  ],
  creatorId: [
    { required: true, message: '请输入创建者ID', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await examApi.createExam(form)
        ElMessage.success('创建考试成功')
        // 创建成功后回到列表并触发列表刷新
        router.push('/exams')
      } catch (error) {
        ElMessage.error(error.response?.data || '创建失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.exam-create {
  padding: 0;
}

.card-header h2 {
  margin: 0;
}
</style>

