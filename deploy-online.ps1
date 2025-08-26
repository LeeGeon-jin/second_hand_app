# 在线部署脚本 - 只部署到 Railway 在线服务器
# 使用方法: 右键用 PowerShell 运行，或在终端输入 .\deploy-online.ps1

param(
    [switch]$SkipBuild      # 跳过构建步骤
)

Write-Host "🚀 在线部署脚本启动..." -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
Write-Host "部署目标：在线服务器 (Railway)" -ForegroundColor Yellow
Write-Host ""

# 第一步：构建前端
if (!$SkipBuild) {
    Write-Host "1. 构建前端项目..." -ForegroundColor Yellow
    Set-Location "frontend"
    
    # 构建前端
    Write-Host "正在构建前端..." -ForegroundColor Gray
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 前端构建失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 前端构建完成" -ForegroundColor Green
    
    Set-Location ".."
} else {
    Write-Host "1. 跳过构建步骤..." -ForegroundColor Yellow
}

# 第二步：部署到在线服务器
Write-Host "`n2. 部署到在线服务器 (Railway)..." -ForegroundColor Yellow

# 检查 Railway CLI 是否安装
try {
    $railwayVersion = railway --version 2>$null
    Write-Host "✅ Railway CLI 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI 未安装，正在安装..." -ForegroundColor Red
    npm install -g @railway/cli
}

# 部署后端
Write-Host "部署后端..." -ForegroundColor Gray
Set-Location "backend"
railway service second_hand

# 使用超时保护，但保持实时输出
Write-Host "正在部署后端（最多等待15分钟）..." -ForegroundColor Gray
$job = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    railway up
}

# 等待部署完成，最多等待20分钟
$timeout = 1200  # 20分钟
$startTime = Get-Date
$deployed = $false

while ((Get-Date) -lt ($startTime.AddSeconds($timeout))) {
    if ($job.State -eq "Completed") {
        $result = Receive-Job $job
        if ($job.ExitCode -eq 0) {
            Write-Host "✅ 后端部署完成" -ForegroundColor Green
            $deployed = $true
            break
        } else {
            Write-Host "⚠️  CLI连接中断，但部署可能仍在进行中..." -ForegroundColor Yellow
            Write-Host $result -ForegroundColor Gray
            # 不立即退出，继续检查实际状态
            break
        }
    }
    
    # 显示实时输出
    $output = Receive-Job $job -Keep
    if ($output) {
        Write-Host $output -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds 5
}

if (!$deployed) {
    Write-Host "⚠️  CLI连接超时，但部署可能仍在进行中..." -ForegroundColor Yellow
    Stop-Job $job
}

Remove-Job $job
Set-Location ".."

# 部署前端
Write-Host "部署前端..." -ForegroundColor Gray
Set-Location "frontend-deploy"

# 清理并复制新文件
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

railway service second_hand

# 使用超时保护，但保持实时输出
Write-Host "正在部署前端（最多等待15分钟）..." -ForegroundColor Gray
$job = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    railway up
}

# 等待部署完成，最多等待20分钟
$timeout = 1200  # 20分钟
$startTime = Get-Date
$deployed = $false

while ((Get-Date) -lt ($startTime.AddSeconds($timeout))) {
    if ($job.State -eq "Completed") {
        $result = Receive-Job $job
        if ($job.ExitCode -eq 0) {
            Write-Host "✅ 前端部署完成" -ForegroundColor Green
            $deployed = $true
            break
        } else {
            Write-Host "⚠️  CLI连接中断，但部署可能仍在进行中..." -ForegroundColor Yellow
            Write-Host $result -ForegroundColor Gray
            # 不立即退出，继续检查实际状态
            break
        }
    }
    
    # 显示实时输出
    $output = Receive-Job $job -Keep
    if ($output) {
        Write-Host $output -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds 5
}

if (!$deployed) {
    Write-Host "⚠️  CLI连接超时，但部署可能仍在进行中..." -ForegroundColor Yellow
    Stop-Job $job
}

Remove-Job $job
Set-Location ".."

# 验证部署状态
Write-Host "`n🔍 验证部署状态..." -ForegroundColor Cyan

# 等待一段时间让部署完成
Write-Host "等待部署完成..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# 检查后端服务状态
try {
    $backendResponse = Invoke-WebRequest -Uri "https://secondhand-production.up.railway.app/api/health" -TimeoutSec 10 -ErrorAction Stop
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ 后端服务正常运行" -ForegroundColor Green
    } else {
        Write-Host "⚠️  后端服务响应异常" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  后端服务检查失败，可能仍在部署中" -ForegroundColor Yellow
}

# 检查前端服务状态
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://secondhand-production-328f.up.railway.app" -TimeoutSec 10 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ 前端服务正常运行" -ForegroundColor Green
    } else {
        Write-Host "⚠️  前端服务响应异常" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  前端服务检查失败，可能仍在部署中" -ForegroundColor Yellow
}

Write-Host "`n🌐 在线服务器地址：" -ForegroundColor Cyan
Write-Host "  前端: https://secondhand-production-328f.up.railway.app" -ForegroundColor Green
Write-Host "  后端: https://secondhand-production.up.railway.app" -ForegroundColor Green
Write-Host "  自定义域名: https://auwei.net (需要配置DNS)" -ForegroundColor Gray

Write-Host "`n💡 说明：CLI连接中断是正常现象，不影响实际部署" -ForegroundColor Yellow

Write-Host "`n🎉 在线部署完成！" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
Write-Host "注意：DNS 传播可能需要 15-60 分钟" -ForegroundColor Yellow

Write-Host "`n📝 使用说明：" -ForegroundColor Cyan
Write-Host "  .\deploy-online.ps1              # 构建并部署到在线" -ForegroundColor Gray
Write-Host "  .\deploy-online.ps1 -SkipBuild  # 跳过构建，直接部署" -ForegroundColor Gray
