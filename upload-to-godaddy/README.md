# GoDaddy上传指南

## 📋 上传步骤

### 方法1：通过cPanel文件管理器
1. 登录GoDaddy cPanel
2. 点击"文件管理器"
3. 导航到 public_html 目录
4. 删除所有现有文件（如果有）
5. 上传 upload-to-godaddy/ 中的所有文件到根目录

### 方法2：通过FTP客户端
1. 使用FileZilla等FTP客户端
2. 连接信息：
   - 主机：你的域名或FTP服务器地址
   - 用户名：你的cPanel用户名
   - 密码：你的cPanel密码
   - 端口：21
3. 连接到 public_html 目录
4. 上传 upload-to-godaddy/ 中的所有文件

### 方法3：使用FTP脚本
运行以下命令（需要提供FTP信息）：
`powershell
.\upload-via-ftp.ps1 -FtpServer "your-domain.com" -Username "your-username" -Password "your-password"
`

## ⚠️ 重要提醒
- 确保后端已部署到外部服务（如Heroku）
- 更新前端API配置指向后端URL
- 配置SSL证书
- 测试所有功能

## 🔧 后端部署
后端需要部署到支持Node.js的服务：
- Heroku (推荐)
- Railway
- Render
- Vercel

## 📞 需要帮助？
如果遇到问题，请检查：
1. 文件是否完整上传
2. 后端服务是否正常运行
3. API配置是否正确
4. 域名DNS设置
