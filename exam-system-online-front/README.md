# 在线考试系统 - 前端

基于 Vue3 + Element Plus 的在线考试系统前端项目。

## 技术栈

- Vue 3
- Vue Router 4
- Pinia
- Element Plus
- Axios
- Vite

## 功能模块

### 1. 认证模块
- 用户登录
- 用户注册

### 2. 考试管理
- 创建考试
- 编辑考试
- 更新考试状态
- 添加题目到考试

### 3. 题目管理
- 创建题目
- 编辑题目
- 根据标签搜索题目

## 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── api/              # API接口定义
│   ├── auth.js       # 认证相关接口
│   ├── exam.js       # 考试相关接口
│   ├── question.js   # 题目相关接口
│   └── request.js    # Axios请求封装
├── assets/           # 静态资源
├── components/       # 公共组件
├── layouts/          # 布局组件
│   └── MainLayout.vue
├── router/           # 路由配置
│   └── index.js
├── stores/           # Pinia状态管理
│   └── auth.js       # 认证状态
├── views/            # 页面组件
│   ├── Login.vue     # 登录页
│   ├── Register.vue  # 注册页
│   ├── exams/        # 考试相关页面
│   └── questions/    # 题目相关页面
├── App.vue           # 根组件
└── main.js           # 入口文件
```

## API配置

后端API地址配置在 `vite.config.js` 中的代理设置，默认指向 `http://localhost:8080`。

## 注意事项

1. 确保后端服务已启动并运行在 8080 端口
2. 部分功能需要后端提供相应的接口支持（如获取考试列表、题目详情等）
3. 认证token存储在localStorage中

