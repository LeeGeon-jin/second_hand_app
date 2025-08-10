# GoDaddy部署指南

## 📋 部署步骤

### 1. 准备文件
- 前端构建文件：`frontend/dist/`
- 后端代码：`backend/`
- 环境配置：`.env`

### 2. GoDaddy cPanel设置

#### 2.1 上传文件
1. 登录GoDaddy cPanel
2. 进入"文件管理器"
3. 导航到 `public_html` 目录
4. 上传 `frontend/dist/` 中的所有文件到根目录

#### 2.2 配置域名
1. 在cPanel中找到"域名"设置
2. 确保域名指向正确的目录

### 3. 后端部署（需要Node.js支持）

#### 3.1 检查GoDaddy支持
- GoDaddy共享主机通常不支持Node.js
- 需要升级到VPS或专用服务器
- 或者使用外部后端服务

#### 3.2 替代方案
1. **使用外部后端服务**：
   - Heroku
   - Railway
   - Render
   - Vercel

2. **修改前端配置**：
   - 更新API端点指向外部后端
   - 修改 `frontend/src/api/index.ts`

### 4. 环境变量配置

#### 4.1 前端环境变量
创建 `frontend/.env.production`：
```env
VITE_API_URL=https://your-backend-url.com
```

#### 4.2 后端环境变量
在外部后端服务中配置：
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=production
```

### 5. 数据库配置
- 使用MongoDB Atlas（云数据库）
- 配置网络访问权限
- 更新连接字符串

### 6. 域名和SSL
1. 在GoDaddy中启用SSL证书
2. 配置HTTPS重定向
3. 更新前端API调用使用HTTPS

## ⚠️ 注意事项

1. **GoDaddy限制**：
   - 共享主机不支持Node.js
   - 需要VPS或专用服务器
   - 或者使用外部后端服务

2. **推荐方案**：
   - 前端：GoDaddy静态托管
   - 后端：Heroku/Railway/Render
   - 数据库：MongoDB Atlas

3. **成本考虑**：
   - GoDaddy VPS：$20-50/月
   - 外部后端：$5-20/月
   - MongoDB Atlas：免费层可用

## 🔧 快速部署脚本

### 构建前端
```bash
cd frontend
npm run build
```

### 上传到GoDaddy
1. 压缩 `frontend/dist/` 内容
2. 上传到GoDaddy cPanel
3. 解压到 `public_html/`

### 配置后端
1. 部署到外部服务（如Heroku）
2. 更新前端API配置
3. 测试功能
