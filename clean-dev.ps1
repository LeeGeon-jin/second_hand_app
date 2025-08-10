# 清理开发环境的PowerShell脚本
# 功能：终止所有Node.js进程、清理端口占用、清空缓存

Write-Host "🧹 开始清理开发环境..." -ForegroundColor Green

# 1. 终止所有Node.js进程
Write-Host "📋 正在终止所有Node.js进程..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "找到 $($nodeProcesses.Count) 个Node.js进程，正在终止..." -ForegroundColor Cyan
        Stop-Process -Name "node" -Force
        Write-Host "✅ 所有Node.js进程已终止" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  没有找到运行中的Node.js进程" -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ 终止Node.js进程时出错: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 等待进程完全终止
Write-Host "⏳ 等待进程完全终止..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# 3. 检查端口占用情况
Write-Host "🔍 检查端口占用情况..." -ForegroundColor Yellow
$ports = @("5174", "5175", "5176", "5177", "5000")
foreach ($port in $ports) {
    $connections = netstat -an | Select-String ":$port\s"
    if ($connections) {
        Write-Host "⚠️  端口 $port 仍有连接: $($connections.Count) 个" -ForegroundColor Yellow
    } else {
        Write-Host "✅ 端口 $port 已释放" -ForegroundColor Green
    }
}

# 4. 清空npm缓存
Write-Host "🗑️  正在清空npm缓存..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✅ npm缓存已清空" -ForegroundColor Green
} catch {
    Write-Host "❌ 清空npm缓存时出错: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 清空前端Vite缓存
Write-Host "🗑️  正在清空前端Vite缓存..." -ForegroundColor Yellow
try {
    if (Test-Path "frontend\node_modules\.vite") {
        Remove-Item -Recurse -Force "frontend\node_modules\.vite" -ErrorAction SilentlyContinue
        Write-Host "✅ 前端Vite缓存已清空" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  前端Vite缓存目录不存在" -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ 清空前端Vite缓存时出错: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. 清空后端缓存（如果有的话）
Write-Host "🗑️  正在清空后端缓存..." -ForegroundColor Yellow
try {
    if (Test-Path "backend\node_modules\.cache") {
        Remove-Item -Recurse -Force "backend\node_modules\.cache" -ErrorAction SilentlyContinue
        Write-Host "✅ 后端缓存已清空" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  后端缓存目录不存在" -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ 清空后端缓存时出错: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. 最终检查
Write-Host "🔍 最终检查..." -ForegroundColor Yellow
$finalNodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($finalNodeProcesses) {
    Write-Host "⚠️  仍有 $($finalNodeProcesses.Count) 个Node.js进程在运行" -ForegroundColor Yellow
    $finalNodeProcesses | ForEach-Object {
        Write-Host "  - PID: $($_.Id), 内存: $([math]::Round($_.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ 所有Node.js进程已完全清理" -ForegroundColor Green
}

Write-Host "🎉 清理完成！" -ForegroundColor Green
Write-Host "💡 提示：现在可以运行 start-dev.ps1 来重新启动开发环境" -ForegroundColor Cyan

# 等待用户按键
Write-Host "`n按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
