# 修复Railway部署脚本
Write-Host "🔧 修复Railway部署配置..." -ForegroundColor Yellow

# 1. 更新前端构建文件
Write-Host "1. 更新前端构建文件..." -ForegroundColor Gray
Set-Location "frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 前端构建失败" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Write-Host "✅ 前端构建完成" -ForegroundColor Green
Set-Location ".."

# 2. 同步前端文件到部署目录
Write-Host "2. 同步前端文件到部署目录..." -ForegroundColor Gray
Remove-Item -Recurse -Force frontend-deploy/assets -ErrorAction SilentlyContinue
Copy-Item -Recurse frontend/dist/* frontend-deploy/
Write-Host "✅ 前端文件同步完成" -ForegroundColor Green

# 3. 检查Railway CLI
Write-Host "3. 检查Railway CLI..." -ForegroundColor Gray
try {
    $railwayVersion = railway --version 2>$null
    Write-Host "✅ Railway CLI 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI 未安装，正在安装..." -ForegroundColor Red
    npm install -g @railway/cli
}

# 4. 部署后端
Write-Host "4. 部署后端..." -ForegroundColor Gray
Set-Location "backend"
railway service second_hand
railway up --detach
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 后端部署失败" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Write-Host "✅ 后端部署完成" -ForegroundColor Green
Set-Location ".."

# 5. 部署前端
Write-Host "5. 部署前端..." -ForegroundColor Gray
Set-Location "frontend-deploy"
railway service second_hand
railway up --detach
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 前端部署失败" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Write-Host "✅ 前端部署完成" -ForegroundColor Green
Set-Location ".."

# 6. 显示部署结果
Write-Host "`n🌐 部署完成！" -ForegroundColor Cyan
Write-Host "  前端: https://secondhand-production-328f.up.railway.app" -ForegroundColor White
Write-Host "  后端: https://secondhand-production.up.railway.app" -ForegroundColor White
Write-Host "  自定义域名: https://auwei.net" -ForegroundColor White

Write-Host "`n📝 注意事项：" -ForegroundColor Yellow
Write-Host "  - Railway可能需要几分钟来完成部署" -ForegroundColor Gray
Write-Host "  - 如果部署失败，请检查Railway控制台日志" -ForegroundColor Gray
Write-Host "  - 确保环境变量已正确配置" -ForegroundColor Gray
