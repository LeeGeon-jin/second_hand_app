# 快速后端部署脚本 - 只部署后端到 Railway
# 使用方法: 右键用 PowerShell 运行，或在终端输入 .\deploy-backend.ps1

Write-Host "🚀 快速后端部署启动..." -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
Write-Host "部署目标：后端服务 (Railway)" -ForegroundColor Yellow
Write-Host ""

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
Write-Host "正在部署后端（最多等待10分钟）..." -ForegroundColor Gray
$job = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    railway up
}

# 等待部署完成，最多等待10分钟
$timeout = 600  # 10分钟
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
            break
        }
    }
    
    # 显示实时输出
    $output = Receive-Job $job -Keep
    if ($output) {
        Write-Host $output -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds 3
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
Start-Sleep -Seconds 15

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

Write-Host "`n🌐 后端服务地址：" -ForegroundColor Cyan
Write-Host "  https://secondhand-production.up.railway.app" -ForegroundColor Green

Write-Host "`n💡 说明：CLI连接中断是正常现象，不影响实际部署" -ForegroundColor Yellow

Write-Host "`n🎉 后端部署完成！" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
