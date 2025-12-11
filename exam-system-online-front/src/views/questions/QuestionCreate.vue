<template>
  <div class="question-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>创建题目</h2>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="题型" prop="questionCategory">
          <el-select v-model="form.questionCategory" placeholder="请选择题型">
            <el-option label="单选题" :value="1" />
            <el-option label="多选题" :value="2" />
            <el-option label="判断题" :value="3" />
            <el-option label="填空题" :value="4" />
            <el-option label="简答题" :value="5" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="题目内容" prop="questionContent">
          <el-input
            v-model="form.questionContent"
            type="textarea"
            :rows="4"
            placeholder="请输入题目内容"
          />
        </el-form-item>
        
        <el-form-item label="选项" prop="questionOptions">
          <el-input
            v-model="form.questionOptions"
            type="textarea"
            :rows="4"
            placeholder="请输入选项（多个选项用换行分隔，如：A.选项1\nB.选项2）"
          />
        </el-form-item>
        
        <el-form-item label="答案" prop="questionAnswer">
          <el-input
            v-model="form.questionAnswer"
            placeholder="请输入答案"
          />
        </el-form-item>
        
        <el-form-item label="标签" prop="questionTags">
          <el-input
            v-model="form.questionTags"
            placeholder="请输入标签（多个标签用逗号分隔）"
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
import { questionApi } from '@/api/question'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  questionCategory: null,
  questionContent: '',
  questionOptions: '',
  questionAnswer: '',
  questionTags: ''
})

const rules = {
  questionCategory: [
    { required: true, message: '请选择题型', trigger: 'change' }
  ],
  questionContent: [
    { required: true, message: '请输入题目内容', trigger: 'blur' }
  ],
  questionAnswer: [
    { required: true, message: '请输入答案', trigger: 'blur' }
  ],
  questionTags: [
    { required: true, message: '请输入标签', trigger: 'blur' },
    { max: 500, message: '标签长度不能超过500', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await questionApi.createQuestion(form)
        ElMessage.success('创建题目成功')
        router.push('/questions')
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
.question-create {
  padding: 0;
}

.card-header h2 {
  margin: 0;
}
</style>

