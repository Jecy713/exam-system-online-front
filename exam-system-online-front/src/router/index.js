import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: (to) => {
      const authStore = useAuthStore()
      const role = authStore.userInfo?.userRole
      if (!role) {
        // 未识别角色时统一跳转到登录，避免误判为学生
        return '/login'
      }
      return role === 1 ? '/student/exams' : '/exams'
    },
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      // 教师/管理员端
      {
        path: '/exams',
        name: 'Exams',
        component: () => import('@/views/exams/ExamList.vue'),
        meta: { roles: [2, 3] }
      },
      {
        path: '/exams/create',
        name: 'ExamCreate',
        component: () => import('@/views/exams/ExamCreate.vue'),
        meta: { roles: [2, 3] }
      },
      {
        path: '/exams/:id/edit',
        name: 'ExamEdit',
        component: () => import('@/views/exams/ExamEdit.vue'),
        meta: { roles: [2, 3] }
      },
      {
        path: '/questions',
        name: 'Questions',
        component: () => import('@/views/questions/QuestionList.vue'),
        meta: { roles: [2, 3] }
      },
      {
        path: '/questions/create',
        name: 'QuestionCreate',
        component: () => import('@/views/questions/QuestionCreate.vue'),
        meta: { roles: [2, 3] }
      },
      {
        path: '/questions/:id/edit',
        name: 'QuestionEdit',
        component: () => import('@/views/questions/QuestionEdit.vue'),
        meta: { roles: [2, 3] }
      },
      // 学生端
      {
        path: '/student/exams',
        name: 'StudentExams',
        component: () => import('@/views/student/StudentExamList.vue'),
        meta: { roles: [1] }
      },
      {
        path: '/student/exams/:examId/take',
        name: 'StudentExamTake',
        component: () => import('@/views/student/StudentExamTake.vue'),
        meta: { roles: [1] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/')
  } else {
    // 角色校验
    if (to.meta?.roles && to.meta.roles.length > 0) {
      const role = authStore.userInfo?.userRole
      if (!role) {
        // 没有角色信息时强制重新登录
        authStore.logout()
        next('/login')
        return
      }
      if (!to.meta.roles.includes(role)) {
        // 根据角色重定向
        next(role === 1 ? '/student/exams' : '/exams')
        return
      }
    }
    next()
  }
})

export default router

