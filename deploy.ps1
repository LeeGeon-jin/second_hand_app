# 部署脚本 - 准备GoDaddy部署文件

Write-Host "🚀 开始准备GoDaddy部署..." -ForegroundColor Green

# 1. 构建前端
Write-Host "📦 构建前端..." -ForegroundColor Yellow
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 前端构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 前端构建完成" -ForegroundColor Green

# 2. 创建部署目录
Write-Host "📁 创建部署目录..." -ForegroundColor Yellow
cd ..
if (Test-Path "deploy") {
    Remove-Item -Recurse -Force "deploy"
}
New-Item -ItemType Directory -Name "deploy"
New-Item -ItemType Directory -Name "deploy/frontend"
New-Item -ItemType Directory -Name "deploy/backend"

# 3. 复制前端文件
Write-Host "📋 复制前端文件..." -ForegroundColor Yellow
Copy-Item -Recurse "frontend/dist/*" "deploy/frontend/"

# 4. 复制后端文件
Write-Host "📋 复制后端文件..." -ForegroundColor Yellow
Copy-Item -Recurse "backend/*" "deploy/backend/"
Remove-Item -Recurse -Force "deploy/backend/node_modules" -ErrorAction SilentlyContinue
Remove-Item "deploy/backend/.env" -ErrorAction SilentlyContinue

# 5. 创建部署说明
Write-Host "📝 创建部署说明..." -ForegroundColor Yellow
$deployReadme = @"
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
"@

$deployReadme | Out-File -FilePath "deploy/README.md" -Encoding UTF8

# 6. 创建压缩包
Write-Host "🗜️ 创建压缩包..." -ForegroundColor Yellow
Compress-Archive -Path "deploy/*" -DestinationPath "godaddy-deploy.zip" -Force

Write-Host "🎉 部署文件准备完成！" -ForegroundColor Green
Write-Host "📦 压缩包：godaddy-deploy.zip" -ForegroundColor Cyan
Write-Host "📁 部署目录：deploy/" -ForegroundColor Cyan
Write-Host "📖 部署说明：deploy/README.md" -ForegroundColor Cyan

Write-Host "`n💡 下一步：" -ForegroundColor Yellow
Write-Host "1. 上传 godaddy-deploy.zip 到GoDaddy" -ForegroundColor White
Write-Host "2. 部署后端到外部服务" -ForegroundColor White
Write-Host "3. 配置域名和SSL" -ForegroundColor White
