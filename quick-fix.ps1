# 快速修复和部署脚本
# 用于修复样式问题并快速部署到在线服务器

Write-Host "🔧 快速修复和部署脚本" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan

# 构建前端
Write-Host "1. 构建前端..." -ForegroundColor Yellow
Set-Location "frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 构建完成" -ForegroundColor Green
Set-Location ".."

# 部署到在线服务器
Write-Host "`n2. 部署到在线服务器..." -ForegroundColor Yellow

# 更新前端部署目录
Set-Location "frontend-deploy"
Remove-Item -Path "*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "../frontend/dist/*" -Destination "." -Recurse

# 重新创建服务器文件
@"
const express = require('express');
const path = require('path');

const app = express();

// 静态文件服务
app.use(express.static(__dirname));

// 所有路由都返回 index.html (SPA 支持)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Frontend server running on port ' + PORT);
});
"@ | Out-File -FilePath "server.js" -Encoding UTF8

@"
{
  "name": "frontend-deploy",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8

# 部署
Write-Host "正在部署到 Railway..." -ForegroundColor Gray
railway service second_hand
railway up --detach
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 部署失败" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Write-Host "✅ 部署完成" -ForegroundColor Green
Set-Location ".."

Write-Host "`n🎉 快速修复完成！" -ForegroundColor Green
Write-Host "访问地址: https://secondhand-production-328f.up.railway.app" -ForegroundColor Cyan
