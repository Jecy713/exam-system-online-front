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
    redirect: '/exams',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/exams',
        name: 'Exams',
        component: () => import('@/views/exams/ExamList.vue')
      },
      {
        path: '/exams/create',
        name: 'ExamCreate',
        component: () => import('@/views/exams/ExamCreate.vue')
      },
      {
        path: '/exams/:id/edit',
        name: 'ExamEdit',
        component: () => import('@/views/exams/ExamEdit.vue')
      },
      {
        path: '/questions',
        name: 'Questions',
        component: () => import('@/views/questions/QuestionList.vue')
      },
      {
        path: '/questions/create',
        name: 'QuestionCreate',
        component: () => import('@/views/questions/QuestionCreate.vue')
      },
      {
        path: '/questions/:id/edit',
        name: 'QuestionEdit',
        component: () => import('@/views/questions/QuestionEdit.vue')
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
    next()
  }
})

export default router

