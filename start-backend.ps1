# 启动后端服务器
Write-Host "正在启动后端服务器..." -ForegroundColor Green

# 切换到backend目录
Set-Location "backend"

# 启动服务器
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden

# 等待服务器启动
Start-Sleep -Seconds 3

# 检查服务器是否启动成功
$portCheck = netstat -an | Select-String ":5000"
if ($portCheck) {
    Write-Host "✅ 后端服务器启动成功！" -ForegroundColor Green
    Write-Host "服务器地址: http://localhost:5000" -ForegroundColor Cyan
} else {
    Write-Host "❌ 后端服务器启动失败" -ForegroundColor Red
}

# 保持脚本运行
Write-Host "按任意键退出..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
