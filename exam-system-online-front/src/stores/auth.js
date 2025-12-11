import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (data) => {
    try {
      const response = await authApi.login(data)
      token.value = response.token || 'mock-token'
      userInfo.value = {
        userId: response.userId,
        username: response.username
      }
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      ElMessage.success(response.message || '登录成功')
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (data) => {
    try {
      const response = await authApi.register(data)
      token.value = response.token || 'mock-token'
      userInfo.value = {
        userId: response.userId,
        username: response.username
      }
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      ElMessage.success(response.message || '注册成功')
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    register,
    logout
  }
})

