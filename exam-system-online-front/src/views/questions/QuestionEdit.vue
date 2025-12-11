<template>
  <div class="question-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>编辑题目</h2>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="题目ID" prop="id">
          <el-input v-model="form.id" disabled />
        </el-form-item>
        
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
            placeholder="请输入选项（多个选项用换行分隔）"
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
            更新
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { questionApi } from '@/api/question'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)
const questionId = ref(route.params.id)

const form = reactive({
  id: questionId.value,
  questionCategory: null,
  questionContent: '',
  questionOptions: '',
  questionAnswer: '',
  questionTags: ''
})

const rules = {
  id: [
    { required: true, message: '题目ID不能为空', trigger: 'blur' }
  ],
  questionTags: [
    { max: 500, message: '标签长度不能超过500', trigger: 'blur' }
  ]
}

// 注意：这里应该调用获取题目详情的API，但后端没有提供
// 实际项目中需要添加获取详情的接口
onMounted(() => {
  // loadQuestionDetail()
})

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await questionApi.updateQuestion(form)
        ElMessage.success('更新题目成功')
        router.push('/questions')
      } catch (error) {
        ElMessage.error(error.response?.data || '更新失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.question-edit {
  padding: 0;
}

.card-header h2 {
  margin: 0;
}
</style>

