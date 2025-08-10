# 部署说明

## 前端部署（GoDaddy）

1. 登录GoDaddy cPanel
2. 进入"文件管理器"
3. 导航到 public_html 目录
4. 上传 deploy/frontend/ 中的所有文件到根目录

## 后端部署（外部服务）

推荐使用以下服务之一：
- Heroku
- Railway
- Render
- Vercel

1. 上传 deploy/backend/ 到外部服务
2. 配置环境变量：
   - MONGODB_URI
   - JWT_SECRET
   - PORT
   - NODE_ENV=production

3. 更新前端API配置：
   在GoDaddy中创建 .env 文件：
   VITE_API_URL=https://your-backend-url.com

## 数据库配置

使用MongoDB Atlas：
1. 创建免费集群
2. 配置网络访问（允许所有IP）
3. 获取连接字符串
4. 在环境变量中设置MONGODB_URI

## 域名配置

1. 在GoDaddy中启用SSL证书
2. 配置HTTPS重定向
3. 测试所有功能

## 注意事项

- GoDaddy共享主机不支持Node.js
- 需要外部后端服务
- 确保所有API调用使用HTTPS
