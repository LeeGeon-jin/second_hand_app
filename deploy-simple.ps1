# 简化部署脚本 - 准备上传文件

Write-Host "🚀 准备GoDaddy部署文件..." -ForegroundColor Green

# 1. 确保前端已构建
Write-Host "📦 检查前端构建..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/dist")) {
    Write-Host "❌ 前端未构建，正在构建..." -ForegroundColor Red
    cd frontend
    npm run build
    cd ..
}

# 2. 创建上传目录
Write-Host "📁 创建上传目录..." -ForegroundColor Yellow
if (Test-Path "upload-to-godaddy") {
    Remove-Item -Recurse -Force "upload-to-godaddy"
}
New-Item -ItemType Directory -Name "upload-to-godaddy"

# 3. 复制前端文件
Write-Host "📋 复制前端文件..." -ForegroundColor Yellow
Copy-Item -Recurse "frontend/dist/*" "upload-to-godaddy/"

# 4. 创建上传说明
$uploadGuide = @"
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
```powershell
.\upload-via-ftp.ps1 -FtpServer "your-domain.com" -Username "your-username" -Password "your-password"
```

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
"@

$uploadGuide | Out-File -FilePath "upload-to-godaddy/README.md" -Encoding UTF8

# 5. 创建压缩包
Write-Host "🗜️ 创建压缩包..." -ForegroundColor Yellow
Compress-Archive -Path "upload-to-godaddy/*" -DestinationPath "godaddy-upload.zip" -Force

Write-Host "🎉 部署文件准备完成！" -ForegroundColor Green
Write-Host "📁 上传目录：upload-to-godaddy/" -ForegroundColor Cyan
Write-Host "📦 压缩包：godaddy-upload.zip" -ForegroundColor Cyan
Write-Host "📖 上传指南：upload-to-godaddy/README.md" -ForegroundColor Cyan

Write-Host "`n💡 下一步：" -ForegroundColor Yellow
Write-Host "1. 登录GoDaddy cPanel" -ForegroundColor White
Write-Host "2. 进入文件管理器" -ForegroundColor White
Write-Host "3. 上传 upload-to-godaddy/ 中的所有文件" -ForegroundColor White
Write-Host "4. 部署后端到外部服务" -ForegroundColor White

