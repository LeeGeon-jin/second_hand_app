# Netlify部署脚本 - 免费主机部署

Write-Host "🚀 准备Netlify部署..." -ForegroundColor Green

# 1. 确保前端已构建
Write-Host "📦 检查前端构建..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/dist")) {
    Write-Host "❌ 前端未构建，正在构建..." -ForegroundColor Red
    cd frontend
    npm run build
    cd ..
}

# 2. 创建Netlify配置文件
Write-Host "📋 创建Netlify配置..." -ForegroundColor Yellow
$netlifyConfig = @"
[build]
  publish = "frontend/dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
"@

$netlifyConfig | Out-File -FilePath "frontend/netlify.toml" -Encoding UTF8

# 3. 创建部署说明
$deployGuide = @"
# Netlify免费部署指南

## 🎉 免费部署方案

### 步骤1：注册Netlify
1. 访问 https://netlify.com
2. 点击"Sign up"注册账户
3. 使用GitHub账户登录（推荐）

### 步骤2：部署网站
1. 登录Netlify后，点击"New site from Git"
2. 选择GitHub
3. 选择你的仓库：LeeGeon-jin/second_hand_app
4. 设置构建命令：`cd frontend && npm install && npm run build`
5. 设置发布目录：`frontend/dist`
6. 点击"Deploy site"

### 步骤3：配置环境变量
在Netlify设置中添加环境变量：
- VITE_API_URL = 你的后端API地址

### 步骤4：自定义域名
1. 在Netlify设置中找到"Domain management"
2. 添加你的GoDaddy域名
3. 在GoDaddy中设置DNS记录指向Netlify

## 🔧 后端部署
后端需要部署到支持Node.js的服务：
- Heroku (推荐)
- Railway
- Render
- Vercel

## 💰 费用
- Netlify：完全免费
- 自定义域名：免费
- SSL证书：免费自动配置

## 🚀 优势
- 自动部署
- 全球CDN
- 免费SSL
- 自动构建
- 版本控制
"@

$deployGuide | Out-File -FilePath "netlify-deploy-guide.md" -Encoding UTF8

Write-Host "🎉 Netlify部署文件准备完成！" -ForegroundColor Green
Write-Host "📖 部署指南：netlify-deploy-guide.md" -ForegroundColor Cyan
Write-Host "📋 Netlify配置：frontend/netlify.toml" -ForegroundColor Cyan

Write-Host "`n💡 推荐使用Netlify：" -ForegroundColor Yellow
Write-Host "✅ 完全免费" -ForegroundColor Green
Write-Host "✅ 自动部署" -ForegroundColor Green
Write-Host "✅ 全球CDN" -ForegroundColor Green
Write-Host "✅ 免费SSL" -ForegroundColor Green
Write-Host "✅ 支持自定义域名" -ForegroundColor Green

