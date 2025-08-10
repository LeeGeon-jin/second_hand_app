# 一键重启开发环境的PowerShell脚本
# 功能：清理环境 + 重新启动前后端

Write-Host "🔄 开始一键重启开发环境..." -ForegroundColor Green

# 1. 先执行清理脚本
Write-Host "🧹 第一步：清理环境..." -ForegroundColor Yellow
& "$PSScriptRoot\clean-dev.ps1"

# 2. 等待一下确保清理完成
Write-Host "⏳ 等待清理完成..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 3. 启动开发环境
Write-Host "🚀 第二步：启动开发环境..." -ForegroundColor Yellow
& "$PSScriptRoot\start-dev.ps1"
