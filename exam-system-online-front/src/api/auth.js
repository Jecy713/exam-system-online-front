import request from './request'

export const authApi = {
  // 登录
  login(data) {
    return request({
      url: '/auth/login',
      method: 'post',
      data
    })
  },
  
  // 注册
  register(data) {
    return request({
      url: '/auth/register',
      method: 'post',
      data
    })
  },

  // 根据用户名查询用户信息（从数据库精确判断身份：学生/教师/管理员）
  getUserInfo(username) {
    return request({
      url: '/auth/user-info',
      method: 'get',
      params: { username }
    })
  }
}

