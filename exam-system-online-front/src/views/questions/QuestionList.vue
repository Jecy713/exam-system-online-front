<template>
  <div class="question-list">
    <div class="header-actions">
      <h2>题目管理</h2>
      <div style="display: flex; gap: 10px;">
        <el-input
          v-model="searchKeyword"
          placeholder="输入关键词搜索（内容/答案/标签等）"
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
      <el-table :data="filteredQuestions" v-loading="loading" style="width: 100%">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { questionApi } from '@/api/question'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const questionList = ref([])
const searchTag = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getCategoryName = (category) => {
  const categories = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '填空题', 5: '简答题' }
  return categories[category] || '未知'
}

const loadQuestions = async () => {
  loading.value = true
  try {
    let res
    if (searchTag.value) {
      // 按标签搜索
      res = await questionApi.searchByTag(searchTag.value, currentPage.value)
    } else {
      // 不输入标签时，加载全部题目列表
      res = await questionApi.listQuestions(currentPage.value, pageSize.value)
    }
    const list = Array.isArray(res?.data) ? res.data : []
    questionList.value = list
    // 后端暂未提供总数，使用当前页长度近似
    total.value = list.length
  } catch (error) {
    ElMessage.error(error.response?.data?.message || error.response?.data || '加载题目失败')
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

const filteredQuestions = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return questionList.value
  return questionList.value.filter((row) => {
    const texts = [
      String(row.id || ''),
      getCategoryName(row.questionCategory || ''),
      row.questionContent || '',
      row.questionOptions || '',
      row.questionAnswer || '',
      row.questionTags || ''
    ].join(' ').toLowerCase()
    return texts.includes(kw)
  })
})

onMounted(() => {
  // 初始加载全部题目列表
  loadQuestions()
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

