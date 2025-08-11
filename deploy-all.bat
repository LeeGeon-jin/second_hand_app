@echo off
chcp 65001 >nul
echo 🚀 一键部署脚本启动...
echo ========================

echo 请选择部署模式：
echo 1. 部署到在线和本地服务器
echo 2. 只部署到在线服务器 (Railway)
echo 3. 只部署到本地服务器
echo 4. 退出

set /p choice=请输入选择 (1-4): 

if "%choice%"=="1" (
    powershell -ExecutionPolicy Bypass -File "deploy-all.ps1"
) else if "%choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File "deploy-all.ps1" -OnlineOnly
) else if "%choice%"=="3" (
    powershell -ExecutionPolicy Bypass -File "deploy-all.ps1" -LocalOnly
) else if "%choice%"=="4" (
    echo 退出部署
    exit /b 0
) else (
    echo 无效选择，请重新运行脚本
    pause
    exit /b 1
)

echo.
echo 部署完成！按任意键退出...
pause >nul
