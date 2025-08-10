# PowerShell 脚本：一键启动前端和后端开发服务器，并自动打开浏览器
# 用法：右键用 PowerShell 运行，或在终端输入 ./start-dev.ps1

Write-Host "正在启动开发服务器..." -ForegroundColor Green

# 启动后端服务器
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd backend; node server.js'

# 等待2秒让后端启动
Start-Sleep -Seconds 2

# 启动前端服务器
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm run dev'

# 等待5秒让前端启动
Write-Host "等待前端服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 尝试启动浏览器
Write-Host "正在启动浏览器..." -ForegroundColor Green
try {
    # 尝试启动默认浏览器访问前端地址
    Start-Process "http://localhost:5173"
    Write-Host "已启动浏览器访问 http://localhost:5173" -ForegroundColor Green
} catch {
    try {
        # 如果5173端口不可用，尝试5174
        Start-Process "http://localhost:5174"
        Write-Host "已启动浏览器访问 http://localhost:5174" -ForegroundColor Green
    } catch {
        try {
            # 如果5174也不可用，尝试5175
            Start-Process "http://localhost:5175"
            Write-Host "已启动浏览器访问 http://localhost:5175" -ForegroundColor Green
        } catch {
            Write-Host "无法自动启动浏览器，请手动访问前端地址" -ForegroundColor Red
        }
    }
}

Write-Host "前端和后端开发服务器已启动。" -ForegroundColor Green
Write-Host "如果浏览器没有自动打开，请手动访问前端地址" -ForegroundColor Yellow
