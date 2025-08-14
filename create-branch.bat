@echo off
cd /d "c:\projects\second_hand_app"

echo === 创建交易系统功能分支 ===
echo 当前目录: %cd%

echo.
echo 检查Git状态...
git status

echo.
echo 创建新分支 feature/transaction-system...
git checkout -b feature/transaction-system

echo.
echo 当前分支:
git branch --show-current

echo.
echo 添加所有更改...
git add .

echo.
echo 提交更改...
git commit -m "feat: 实现完整的双方确认交易系统和评价功能"

echo.
echo 推送到远程仓库...
git push -u origin feature/transaction-system

echo.
echo === 操作完成 ===
echo 检查所有分支:
git branch -a

echo.
echo 最近提交:
git log --oneline -3

pause
