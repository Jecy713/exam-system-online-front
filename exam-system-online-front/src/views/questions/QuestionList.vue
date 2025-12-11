<template>
  <div class="question-list">
    <div class="header-actions">
      <h2>题目管理</h2>
      <div style="display: flex; gap: 10px;">
        <el-input
          v-model="searchTag"
          placeholder="输入标签搜索"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="$router.push('/questions/create')">
          <el-icon><Plus /></el-icon>
          创建题目
        </el-button>
      </div>
    </div>
    
    <el-card>
      <el-table :data="questionList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="questionCategory" label="题型" width="120">
          <template #default="{ row }">
            {{ getCategoryName(row.questionCategory) }}
          </template>
        </el-table-column>
        <el-table-column prop="questionContent" label="题目内容" show-overflow-tooltip />
        <el-table-column prop="questionOptions" label="选项" show-overflow-tooltip />
        <el-table-column prop="questionAnswer" label="答案" width="150" />
        <el-table-column prop="questionTags" label="标签" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="10"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { questionApi } from '@/api/question'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const questionList = ref([])
const searchTag = ref('')
const currentPage = ref(1)
const total = ref(0)

const getCategoryName = (category) => {
  const categories = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '填空题', 5: '简答题' }
  return categories[category] || '未知'
}

const loadQuestions = async () => {
  if (!searchTag.value) {
    ElMessage.warning('请输入标签进行搜索')
    return
  }
  
  loading.value = true
  try {
    const data = await questionApi.searchByTag(searchTag.value, currentPage.value)
    questionList.value = Array.isArray(data) ? data : []
    // 注意：后端没有返回总数，这里假设有数据
    total.value = questionList.value.length > 0 ? questionList.value.length * 10 : 0
  } catch (error) {
    ElMessage.error(error.response?.data || '搜索失败')
    questionList.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadQuestions()
}

const handlePageChange = () => {
  loadQuestions()
}

const handleEdit = (row) => {
  router.push(`/questions/${row.id}/edit`)
}

onMounted(() => {
  // 初始不加载，需要用户输入标签搜索
})
</script>

<style scoped>
.question-list {
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

