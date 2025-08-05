# PowerShell 脚本：一键启动前端和后端开发服务器
# 用法：右键用 PowerShell 运行，或在终端输入 ./start-dev.ps1

Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd backend; node server.js'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm run dev'

Write-Host "前端和后端开发服务器已启动。"
