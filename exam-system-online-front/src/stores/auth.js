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
      // 后端返回 Result<LoginResponse> 结构：{ code, message, data: { userId, username } }
      if (res.code !== 200 || !res.data) {
        throw new Error(res.message || '登录失败')
      }

      // 后端未提供 token，这里使用本地伪 token 仅作为登录态标记
      token.value = `login-${res.data.userId}`

      // 登录成功后，根据用户名从后端精确查询角色（学生/教师/管理员）
      const infoRes = await authApi.getUserInfo(res.data.username)
      if (infoRes.code !== 200 || !infoRes.data) {
        throw new Error(infoRes.message || '获取用户信息失败')
      }

      const identity = infoRes.data.identity || '学生'
      // 将后端 identity 映射为数值角色：1学生 2教师 3管理员
      const roleMap = { 学生: 1, 老师: 2, 教师: 2, 管理员: 3 }
      const userRole = roleMap[identity] ?? 1

      userInfo.value = {
        userId: infoRes.data.userId,
        username: infoRes.data.username,
        userRole,
        identity
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

      // 注册完成后，同样通过用户名查询数据库中的角色
      const infoRes = await authApi.getUserInfo(res.data.username)
      if (infoRes.code !== 200 || !infoRes.data) {
        throw new Error(infoRes.message || '获取用户信息失败')
      }

      const identity = infoRes.data.identity || '学生'
      const roleMap = { 学生: 1, 老师: 2, 教师: 2, 管理员: 3 }
      const userRole = roleMap[identity] ?? 1

      userInfo.value = {
        userId: infoRes.data.userId,
        username: infoRes.data.username,
        userRole,
        identity
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

