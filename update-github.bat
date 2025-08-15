@echo off
chcp 65001 >nul
echo 🚀 一键更新到GitHub
echo ================================

powershell -ExecutionPolicy Bypass -File "update-github.ps1"

echo.
echo 按任意键退出...
pause >nul
