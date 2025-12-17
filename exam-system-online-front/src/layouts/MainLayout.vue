<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-left">
        <h2>在线考试系统</h2>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><User /></el-icon>
            {{ authStore.userInfo?.username || '用户' }}
            <span class="role-tag">{{ roleLabel }}</span>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          router
          class="sidebar-menu"
        >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <template v-if="isTeacher">
          <el-menu-item index="/exams">
            <el-icon><Document /></el-icon>
            <span>考试管理</span>
          </el-menu-item>
          <el-menu-item index="/questions">
            <el-icon><QuestionFilled /></el-icon>
            <span>题目管理</span>
          </el-menu-item>
        </template>
        <template v-else>
          <el-menu-item index="/student/exams">
            <el-icon><Document /></el-icon>
            <span>考试大厅</span>
          </el-menu-item>
        </template>
        </el-menu>
      </el-aside>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'
import { User, ArrowDown, Document, QuestionFilled, HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isTeacher = computed(() => {
  const role = authStore.userInfo?.userRole ?? 1
  return role === 2 || role === 3
})

const roleLabel = computed(() => {
  const role = authStore.userInfo?.userRole ?? 1
  if (role === 3) return '管理员'
  if (role === 2) return '教师'
  return '学生'
})

const activeMenu = computed(() => {
  if (route.path === '/dashboard' || route.path === '/') return '/dashboard'
  if (route.path.startsWith('/exams')) return '/exams'
  if (route.path.startsWith('/questions')) return '/questions'
  if (route.path.startsWith('/student/exams')) return '/student/exams'
  return route.path
})

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      authStore.logout()
      router.push('/login')
    })
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background: #409eff;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 5px;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
}
</style>

