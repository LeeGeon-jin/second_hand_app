# PowerShell 脚本：一键关闭前端和后端开发服务器
# 用法：右键用 PowerShell 运行，或在终端输入 ./stop-dev.ps1

Write-Host "🛑 关闭开发服务器..." -ForegroundColor Red
Write-Host "========================" -ForegroundColor Cyan

# 第一步：检查并关闭5173端口（前端）
Write-Host "1. 检查并关闭前端服务器 (端口5173)..." -ForegroundColor Yellow
$port5173 = netstat -ano | findstr :5173

if ($port5173) {
    Write-Host "⚠️  发现5173端口被占用，正在关闭..." -ForegroundColor Yellow
    
    # 获取占用5173端口的进程ID
    $processIds = $port5173 | ForEach-Object {
        $parts = $_ -split '\s+'
        $parts[-1]  # 最后一个部分是进程ID
    } | Where-Object { $_ -ne "" } | Sort-Object -Unique
    
    # 终止占用5173端口的进程
    foreach ($processId in $processIds) {
        try {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "正在终止进程: $processId ($($process.ProcessName))" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force
                Write-Host "✅ 已终止进程 $processId" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ 无法终止进程 $processId" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ 5173端口未被占用" -ForegroundColor Green
}

# 第二步：检查并关闭5000端口（后端）
Write-Host "`n2. 检查并关闭后端服务器 (端口5000)..." -ForegroundColor Yellow
$port5000 = netstat -ano | findstr :5000

if ($port5000) {
    Write-Host "⚠️  发现5000端口被占用，正在关闭..." -ForegroundColor Yellow
    
    # 获取占用5000端口的进程ID
    $processIds = $port5000 | ForEach-Object {
        $parts = $_ -split '\s+'
        $parts[-1]  # 最后一个部分是进程ID
    } | Where-Object { $_ -ne "" } | Sort-Object -Unique
    
    # 终止占用5000端口的进程
    foreach ($processId in $processIds) {
        try {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "正在终止进程: $processId ($($process.ProcessName))" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force
                Write-Host "✅ 已终止进程 $processId" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ 无法终止进程 $processId" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ 5000端口未被占用" -ForegroundColor Green
}

# 第三步：清理其他可能的Node.js进程
Write-Host "`n3. 清理其他Node.js相关进程..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {
    $_.ProcessName -like "*node*" -or 
    $_.ProcessName -like "*npm*" -or 
    $_.ProcessName -like "*vite*"
}

if ($nodeProcesses) {
    Write-Host "发现以下Node.js相关进程：" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "  - $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Gray
    }
    
    $nodeProcesses | ForEach-Object {
        try {
            Write-Host "正在终止进程: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force
            Write-Host "✅ 已终止进程 $($_.ProcessName)" -ForegroundColor Green
        } catch {
            Write-Host "❌ 无法终止进程 $($_.ProcessName)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ 没有发现其他Node.js相关进程" -ForegroundColor Green
}

# 第四步：最终验证
Write-Host "`n4. 最终验证端口状态..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$finalCheck5173 = netstat -ano | findstr :5173
$finalCheck5000 = netstat -ano | findstr :5000

if (-not $finalCheck5173 -and -not $finalCheck5000) {
    Write-Host "✅ 所有开发服务器端口已成功释放" -ForegroundColor Green
} else {
    Write-Host "⚠️  仍有端口被占用：" -ForegroundColor Yellow
    if ($finalCheck5173) {
        Write-Host "  - 端口5173仍被占用" -ForegroundColor Red
    }
    if ($finalCheck5000) {
        Write-Host "  - 端口5000仍被占用" -ForegroundColor Red
    }
}

Write-Host "`n🎉 开发服务器关闭完成！" -ForegroundColor Green
Write-Host "所有相关进程已终止，端口已释放" -ForegroundColor Cyan















