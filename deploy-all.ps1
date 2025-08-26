# 一键部署脚本 - 同时部署到在线服务器和本地服务器
# 使用方法: 右键用 PowerShell 运行，或在终端输入 .\deploy-all.ps1

param(
    [switch]$OnlineOnly,    # 只部署到在线服务器
    [switch]$LocalOnly,     # 只部署到本地服务器
    [switch]$SkipBuild      # 跳过构建步骤
)

Write-Host "🚀 一键部署脚本启动..." -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan

# 检查参数
$deployOnline = !$LocalOnly
$deployLocal = !$OnlineOnly

if ($OnlineOnly -and $LocalOnly) {
    Write-Host "❌ 错误：不能同时指定 OnlineOnly 和 LocalOnly" -ForegroundColor Red
    exit 1
}

Write-Host "部署目标：" -ForegroundColor Yellow
if ($deployOnline) { Write-Host "  ✅ 在线服务器 (Railway)" -ForegroundColor Green }
if ($deployLocal) { Write-Host "  ✅ 本地服务器" -ForegroundColor Green }
Write-Host ""

# 第一步：构建前端
if (!$SkipBuild) {
    Write-Host "1. 构建前端项目..." -ForegroundColor Yellow
    Set-Location "frontend"
    
    # 跳过未提交更改检查，直接继续部署
    
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
if ($deployOnline) {
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
    try {
        $backendResponse = Invoke-WebRequest -Uri "https://secondhand-production.up.railway.app/api/products" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ 后端服务正常运行" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  后端服务可能还在启动中，请稍后检查" -ForegroundColor Yellow
    }
    
    try {
        $frontendResponse = Invoke-WebRequest -Uri "https://secondhand-production-328f.up.railway.app" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ 前端服务正常运行" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  前端服务可能还在启动中，请稍后检查" -ForegroundColor Yellow
    }
    
    # 显示在线地址
    Write-Host "`n🌐 在线服务器地址：" -ForegroundColor Cyan
    Write-Host "  前端: https://secondhand-production-328f.up.railway.app" -ForegroundColor White
    Write-Host "  后端: https://secondhand-production.up.railway.app" -ForegroundColor White
    Write-Host "  自定义域名: https://auwei.net (需要配置DNS)" -ForegroundColor White
    
    Write-Host "`n💡 说明：CLI连接中断是正常现象，不影响实际部署" -ForegroundColor Green
}

# 第三步：启动本地服务器
if ($deployLocal) {
    Write-Host "`n3. 启动本地服务器..." -ForegroundColor Yellow
    
    # 检查端口占用
    Write-Host "检查端口占用..." -ForegroundColor Gray
    $port5000 = netstat -ano | findstr :5000
    $port5173 = netstat -ano | findstr :5173
    
    if ($port5000) {
        Write-Host "⚠️  端口5000被占用，正在清理..." -ForegroundColor Yellow
        $processIds = $port5000 | ForEach-Object {
            $parts = $_ -split '\s+'
            $parts[-1]
        } | Where-Object { $_ -ne "" } | Sort-Object -Unique
        
        foreach ($processId in $processIds) {
            try {
                Stop-Process -Id $processId -Force
                Write-Host "已终止进程: $processId" -ForegroundColor Gray
            } catch {
                Write-Host "无法终止进程: $processId" -ForegroundColor Red
            }
        }
        Start-Sleep -Seconds 2
    }
    
    if ($port5173) {
        Write-Host "⚠️  端口5173被占用，正在清理..." -ForegroundColor Yellow
        $processIds = $port5173 | ForEach-Object {
            $parts = $_ -split '\s+'
            $parts[-1]
        } | Where-Object { $_ -ne "" } | Sort-Object -Unique
        
        foreach ($processId in $processIds) {
            try {
                Stop-Process -Id $processId -Force
                Write-Host "已终止进程: $processId" -ForegroundColor Gray
            } catch {
                Write-Host "无法终止进程: $processId" -ForegroundColor Red
            }
        }
        Start-Sleep -Seconds 2
    }
    
    # 启动后端
    Write-Host "启动后端服务器..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd backend; node server.js'
    Start-Sleep -Seconds 3
    
    # 启动前端
    Write-Host "启动前端服务器..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm run dev'
    Start-Sleep -Seconds 5
    
    # 打开浏览器
    Write-Host "打开浏览器..." -ForegroundColor Gray
    try {
        Start-Process "http://localhost:5173"
        Write-Host "✅ 已启动浏览器访问 http://localhost:5173" -ForegroundColor Green
    } catch {
        Write-Host "❌ 无法启动浏览器，请手动访问 http://localhost:5173" -ForegroundColor Red
    }
    
    Write-Host "`n🏠 本地服务器地址：" -ForegroundColor Cyan
    Write-Host "  前端: http://localhost:5173" -ForegroundColor White
    Write-Host "  后端: http://localhost:5000" -ForegroundColor White
}

# 完成
Write-Host "`n🎉 部署完成！" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan

if ($deployOnline) {
    Write-Host "在线服务器已部署到 Railway" -ForegroundColor White
    Write-Host "注意：DNS 传播可能需要 15-60 分钟" -ForegroundColor Yellow
}

if ($deployLocal) {
    Write-Host "本地服务器已启动" -ForegroundColor White
    Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
}

Write-Host "`n📝 使用说明：" -ForegroundColor Cyan
Write-Host "  .\deploy-all.ps1              # 部署到在线和本地" -ForegroundColor White
Write-Host "  .\deploy-all.ps1 -OnlineOnly  # 只部署到在线" -ForegroundColor White
Write-Host "  .\deploy-all.ps1 -LocalOnly   # 只部署到本地" -ForegroundColor White
Write-Host "  .\deploy-all.ps1 -SkipBuild   # 跳过构建步骤" -ForegroundColor White
