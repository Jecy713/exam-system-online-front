<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-banner" shadow="never">
      <div class="banner-content">
        <div class="banner-text">
          <h1>欢迎使用在线考试系统</h1>
          <p>高效、便捷的在线考试管理平台</p>
        </div>
        <div class="banner-icon">
          <el-icon :size="80" color="#409EFF"><Document /></el-icon>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" :class="stat.type" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change" :class="stat.trend">
              <el-icon><component :is="stat.trendIcon" /></el-icon>
              {{ stat.change }}
            </span>
            <span class="stat-desc">较昨日</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="content-row">
      <!-- 左侧：最近考试 -->
      <el-col :xs="24" :md="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>
                <el-icon><List /></el-icon>
                最近考试
              </span>
              <el-button
                v-if="isTeacher"
                text
                type="primary"
                @click="$router.push('/exams')"
              >
                查看全部
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-button
                v-else
                text
                type="primary"
                @click="$router.push('/student/exams')"
              >
                查看全部
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="exam-list-container">
            <el-empty v-if="recentExams.length === 0" description="暂无考试数据" :image-size="100" />
            <div v-else class="exam-items">
              <div
                v-for="exam in recentExams"
                :key="exam.id"
                class="exam-item"
                @click="handleExamClick(exam)"
              >
                <div class="exam-item-header">
                  <h3>{{ exam.examName }}</h3>
                  <el-tag :type="getStatusType(exam.status)" size="small">
                    {{ getStatusName(exam.status) }}
                  </el-tag>
                </div>
                <p class="exam-description">{{ exam.examDescription || '暂无描述' }}</p>
                <div class="exam-item-footer">
                  <span class="exam-time">
                    <el-icon><Clock /></el-icon>
                    {{ formatDate(exam.startTime) }}
                  </span>
                  <span class="exam-duration">
                    <el-icon><Timer /></el-icon>
                    {{ exam.duration }}分钟
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：快速操作和统计 -->
      <el-col :xs="24" :md="10">
        <!-- 快速操作（仅教师/管理员可见） -->
        <el-card v-if="isTeacher" shadow="hover" class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <span>
                <el-icon><Lightning /></el-icon>
                快速操作
              </span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button
              type="primary"
              :icon="Plus"
              @click="$router.push('/exams/create')"
              class="action-btn"
            >
              创建考试
            </el-button>
            <el-button
              type="success"
              :icon="EditPen"
              @click="$router.push('/questions/create')"
              class="action-btn"
            >
              创建题目
            </el-button>
            <el-button
              type="info"
              :icon="List"
              @click="$router.push('/exams')"
              class="action-btn"
            >
              考试列表
            </el-button>
            <el-button
              type="warning"
              :icon="Document"
              @click="$router.push('/questions')"
              class="action-btn"
            >
              题目管理
            </el-button>
          </div>
        </el-card>

        <!-- 系统信息 -->
        <el-card shadow="hover" class="system-info-card">
          <template #header>
            <div class="card-header">
              <span>
                <el-icon><InfoFilled /></el-icon>
                系统信息
              </span>
            </div>
          </template>
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">当前时间：</span>
              <span class="info-value">{{ currentTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">系统版本：</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">浏览器：</span>
              <span class="info-value">{{ browserInfo }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据图表区域 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><DataAnalysis /></el-icon>
            数据统计
          </span>
        </div>
      </template>
      <div class="chart-container">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <div class="chart-item">
              <div class="chart-title">考试类型分布</div>
              <div class="chart-placeholder">
                <el-icon :size="60" color="#409EFF"><PieChart /></el-icon>
                <p>饼图可视化</p>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="chart-item">
              <div class="chart-title">月度考试趋势</div>
              <div class="chart-placeholder">
                <el-icon :size="60" color="#67C23A"><TrendCharts /></el-icon>
                <p>折线图可视化</p>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="chart-item">
              <div class="chart-title">题目类型统计</div>
              <div class="chart-placeholder">
                <el-icon :size="60" color="#E6A23C"><Histogram /></el-icon>
                <p>柱状图可视化</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Document,
  List,
  ArrowRight,
  Clock,
  Timer,
  Lightning,
  Plus,
  EditPen,
  InfoFilled,
  DataAnalysis,
  PieChart,
  TrendCharts,
  Histogram,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const currentTime = ref('')
const browserInfo = ref('')
let timeInterval = null

// 统计数据
const stats = ref([
  {
    title: '总考试数',
    value: '12',
    change: '+3',
    trend: 'up',
    trendIcon: ArrowUp,
    icon: Document,
    type: 'primary'
  },
  {
    title: '进行中',
    value: '5',
    change: '+1',
    trend: 'up',
    trendIcon: ArrowUp,
    icon: Timer,
    type: 'success'
  },
  {
    title: '总题目数',
    value: '156',
    change: '+12',
    trend: 'up',
    trendIcon: ArrowUp,
    icon: List,
    type: 'warning'
  },
  {
    title: '今日访问',
    value: '1,234',
    change: '+89',
    trend: 'up',
    trendIcon: ArrowUp,
    icon: DataAnalysis,
    type: 'info'
  }
])

// 最近考试数据
const recentExams = ref([
  {
    id: 1,
    examName: '2024年春季期末考试',
    examDescription: '包含数学、英语、计算机等科目',
    status: 2,
    startTime: '2024-01-15 09:00:00',
    duration: 120
  },
  {
    id: 2,
    examName: 'JavaScript基础知识测试',
    examDescription: '前端开发基础能力评估',
    status: 1,
    startTime: '2024-01-20 14:00:00',
    duration: 90
  },
  {
    id: 3,
    examName: 'Vue.js实战考核',
    examDescription: 'Vue框架应用能力测试',
    status: 3,
    startTime: '2024-01-10 10:00:00',
    duration: 60
  }
])

// 更新时间
const updateTime = () => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// 获取浏览器信息
const getBrowserInfo = () => {
  const ua = navigator.userAgent
  if (ua.indexOf('Chrome') > -1) {
    browserInfo.value = 'Chrome'
  } else if (ua.indexOf('Firefox') > -1) {
    browserInfo.value = 'Firefox'
  } else if (ua.indexOf('Safari') > -1) {
    browserInfo.value = 'Safari'
  } else if (ua.indexOf('Edge') > -1) {
    browserInfo.value = 'Edge'
  } else {
    browserInfo.value = '其他浏览器'
  }
}

const getStatusName = (status) => {
  const statuses = { 1: '未开始', 2: '进行中', 3: '已结束', 4: '已归档' }
  return statuses[status] || '未知'
}

const getStatusType = (status) => {
  const types = { 1: 'info', 2: 'success', 3: 'warning', 4: '' }
  return types[status] || ''
}

const formatDate = (dateTime) => {
  if (!dateTime) return '-'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}

const isTeacher = computed(() => {
  const role = authStore.userInfo?.userRole ?? 1
  return role === 2 || role === 3
})

const handleExamClick = (exam) => {
  if (isTeacher.value) {
    router.push(`/exams/${exam.id}/edit`)
  } else {
    router.push('/student/exams')
  }
}

onMounted(() => {
  updateTime()
  getBrowserInfo()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

/* 欢迎横幅 */
.welcome-banner {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.welcome-banner :deep(.el-card__body) {
  padding: 30px;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-text h1 {
  color: white;
  font-size: 28px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.banner-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin: 0;
}

.banner-icon {
  opacity: 0.3;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-left: 4px solid;
}

.stat-card.primary {
  border-left-color: #409EFF;
}

.stat-card.success {
  border-left-color: #67C23A;
}

.stat-card.warning {
  border-left-color: #E6A23C;
}

.stat-card.info {
  border-left-color: #909399;
}

.stat-content {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stat-icon {
  margin-right: 20px;
  padding: 15px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.stat-card.success .stat-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-card.warning .stat-icon {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.stat-card.info .stat-icon {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
}

.stat-change.up {
  color: #67C23A;
}

.stat-change.down {
  color: #F56C6C;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

/* 内容区域 */
.content-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 考试列表 */
.exam-list-container {
  max-height: 400px;
  overflow-y: auto;
}

.exam-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exam-item {
  padding: 15px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.exam-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.exam-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exam-item-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.exam-description {
  color: #606266;
  font-size: 14px;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.exam-item-footer {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #909399;
}

.exam-time,
.exam-duration {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 快速操作 */
.quick-actions-card {
  margin-bottom: 20px;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.action-btn {
  width: 100%;
  height: 50px;
  font-size: 15px;
}

/* 系统信息 */
.system-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #F5F7FA;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #909399;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

/* 图表区域 */
.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  padding: 20px 0;
}

.chart-item {
  text-align: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.chart-placeholder {
  padding: 40px 20px;
  background: #F5F7FA;
  border-radius: 8px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.chart-placeholder p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .banner-icon {
    margin-top: 20px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>

