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
  }
}

