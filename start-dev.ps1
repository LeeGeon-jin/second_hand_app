# PowerShell 脚本：一键启动前端和后端开发服务器，并自动打开浏览器
# 用法：右键用 PowerShell 运行，或在终端输入 ./start-dev.ps1

Write-Host "🚀 启动开发服务器..." -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan

# 第一步：检查并清理5173端口
Write-Host "1. 检查5173端口占用情况..." -ForegroundColor Yellow
$port5173 = netstat -ano | findstr :5173

if ($port5173) {
    Write-Host "⚠️  发现5173端口被占用，正在清理..." -ForegroundColor Red
    Write-Host "占用的进程信息：" -ForegroundColor Yellow
    $port5173 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
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
    
    # 等待端口释放
    Write-Host "等待端口释放..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    
    # 再次检查端口是否已释放
    $port5173After = netstat -ano | findstr :5173
    if ($port5173After) {
        Write-Host "❌ 5173端口仍然被占用，请手动检查" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ 5173端口已成功释放" -ForegroundColor Green
    }
} else {
    Write-Host "✅ 5173端口未被占用" -ForegroundColor Green
}

# 第二步：启动后端服务器
Write-Host "`n2. 启动后端服务器..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd backend; node server.js'

# 等待2秒让后端启动
Start-Sleep -Seconds 2

# 第三步：启动前端服务器
Write-Host "3. 启动前端服务器..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm run dev'

# 等待5秒让前端启动
Write-Host "等待前端服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 第四步：启动浏览器（只使用5173端口）
Write-Host "4. 启动浏览器..." -ForegroundColor Yellow
try {
    Start-Process "http://localhost:5173"
    Write-Host "✅ 已启动浏览器访问 http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ 无法启动浏览器，请手动访问 http://localhost:5173" -ForegroundColor Red
}

Write-Host "`n🎉 开发服务器启动完成！" -ForegroundColor Green
Write-Host "前端地址: http://localhost:5173" -ForegroundColor Cyan
Write-Host "后端地址: http://localhost:5000" -ForegroundColor Cyan
Write-Host "如果浏览器没有自动打开，请手动访问前端地址" -ForegroundColor Yellow
