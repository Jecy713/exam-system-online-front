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
      const res = await authApi.login(data)
      // 后端返回 Result<LoginResponse> 结构：{ code, message, data: { userId, username, userRole? } }
      if (res.code !== 200 || !res.data) {
        throw new Error(res.message || '登录失败')
      }

      // 后端未提供 token，这里使用本地伪 token 仅作为登录态标记
      token.value = `login-${res.data.userId}`
      userInfo.value = {
        userId: res.data.userId,
        username: res.data.username,
        userRole: res.data.userRole ?? 1 // 默认学生
      }
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      ElMessage.success(res.message || '登录成功')
      return res
    } catch (error) {
      throw error
    }
  }

  const register = async (data) => {
    try {
      const res = await authApi.register(data)
      // 返回 Result<LoginResponse>
      if (res.code !== 200 || !res.data) {
        throw new Error(res.message || '注册失败')
      }

      token.value = `login-${res.data.userId}`
      userInfo.value = {
        userId: res.data.userId,
        username: res.data.username,
        userRole: res.data.userRole ?? 1
      }
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      ElMessage.success(res.message || '注册成功')
      return res
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

