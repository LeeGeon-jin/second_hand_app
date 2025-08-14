# 二手交易平台开发启动脚本
param(
    [switch]$Help
)

if ($Help) {
    Write-Host "二手交易平台开发启动脚本" -ForegroundColor Green
    Write-Host "用法: .\start-dev.ps1 [选项]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "选项:" -ForegroundColor Yellow
    Write-Host "  -Help    显示此帮助信息"
    exit
}

# 检查Node.js
Write-Host "检查Node.js安装..." -ForegroundColor Blue
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查MongoDB
Write-Host "检查MongoDB连接..." -ForegroundColor Blue
$mongoRunning = $false
try {
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        $mongoRunning = $true
        Write-Host "MongoDB正在运行" -ForegroundColor Green
    }
} catch {
    Write-Host "MongoDB未运行，尝试启动..." -ForegroundColor Yellow
}

if (-not $mongoRunning) {
    try {
        Start-Process "mongod" -WindowStyle Hidden
        Start-Sleep 3
        Write-Host "MongoDB已启动" -ForegroundColor Green
    } catch {
        Write-Host "警告: MongoDB启动失败，请手动启动MongoDB服务" -ForegroundColor Yellow
    }
}

# 安装依赖
Write-Host "安装后端依赖..." -ForegroundColor Blue
Set-Location "backend"
if (!(Test-Path "node_modules")) {
    npm install
}

Write-Host "安装前端依赖..." -ForegroundColor Blue
Set-Location "..\frontend"
if (!(Test-Path "node_modules")) {
    npm install
}

# 创建上传目录
Write-Host "创建上传目录..." -ForegroundColor Blue
Set-Location ".."
if (!(Test-Path "backend\uploads")) {
    New-Item -ItemType Directory -Path "backend\uploads" -Force
}

# 启动后端服务
Write-Host "启动后端服务..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-Command", "cd '$PWD\backend'; npm run dev" -WindowStyle Normal

# 等待后端启动
Start-Sleep 3

# 启动前端服务
Write-Host "启动前端服务..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal

# 等待前端启动
Start-Sleep 5

# 自动打开浏览器
Write-Host "打开浏览器..." -ForegroundColor Blue
try {
    Start-Process "http://localhost:5173"
} catch {
    Write-Host "无法自动打开浏览器" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "开发服务器启动完成！" -ForegroundColor Green
Write-Host "前端地址: http://localhost:5173" -ForegroundColor Cyan
Write-Host "后端地址: http://localhost:5000" -ForegroundColor Cyan
Write-Host "如果浏览器没有自动打开，请手动访问前端地址" -ForegroundColor Yellow
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
