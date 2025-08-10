# 二手交易应用 (Second Hand Trading App)

一个基于React + Node.js的二手商品交易平台，支持AI估价功能。

## 🚀 快速开始

### 一键启动开发环境
```powershell
.\start-dev.ps1
```

### 一键清理环境
```powershell
.\clean-dev.ps1
```

### 一键重启开发环境
```powershell
.\restart-dev.ps1
```

## 📋 脚本说明

### `start-dev.ps1` - 启动开发环境
- 启动后端服务器 (端口5000)
- 启动前端开发服务器 (端口5174)
- 自动打开浏览器到前端页面

### `clean-dev.ps1` - 清理开发环境
- 终止所有Node.js进程
- 释放端口占用 (5174, 5175, 5176, 5177, 5000)
- 清空npm缓存
- 清空前端Vite缓存
- 清空后端缓存

### `restart-dev.ps1` - 一键重启
- 先执行清理脚本
- 然后重新启动开发环境

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Ant Design Mobile
- Vite

### 后端
- Node.js
- Express.js
- MongoDB
- JWT认证

### AI功能
- 本地智能AI估价算法
- 品牌识别
- 成色分析
- 类别定价

## 📱 功能特性

- ✅ 用户注册/登录
- ✅ 商品发布/浏览
- ✅ AI智能估价
- ✅ 地址验证
- ✅ 图片上传
- ✅ 分类筛选
- ✅ 搜索功能
- ✅ 聊天系统

## 🔧 手动启动

如果脚本无法使用，可以手动启动：

### 启动后端
```bash
cd backend
npm install
node server.js
```

### 启动前端
```bash
cd frontend
npm install
npm run dev
```

## 🌐 访问地址

- 前端: http://localhost:5174
- 后端API: http://localhost:5000

## 📝 注意事项

1. 确保已安装Node.js (版本 >= 16)
2. 确保MongoDB连接正常
3. 如果端口被占用，脚本会自动选择其他端口
4. 使用`clean-dev.ps1`可以解决大部分端口冲突问题
