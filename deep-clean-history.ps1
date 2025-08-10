# 深度清理Git历史中的敏感信息
# 这是一个更彻底的清理脚本

Write-Host "🚨 深度清理Git历史" -ForegroundColor Red
Write-Host "========================" -ForegroundColor Red

Write-Host "⚠️  警告：将彻底清理所有Git历史中的敏感信息" -ForegroundColor Yellow
Write-Host "这将创建一个全新的Git历史，所有提交ID都会改变" -ForegroundColor Yellow

$response = Read-Host "`n是否继续？这将删除所有历史记录！(y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "`n开始深度清理..." -ForegroundColor Green
    
    # 1. 备份当前文件
    Write-Host "1. 备份当前文件..." -ForegroundColor Yellow
    $backupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Name $backupDir
    Copy-Item -Recurse "backend" "$backupDir/"
    Copy-Item -Recurse "frontend" "$backupDir/"
    Copy-Item -Recurse "deploy" "$backupDir/"
    Copy-Item "*.md" "$backupDir/"
    Copy-Item "*.ps1" "$backupDir/"
    Write-Host "✅ 备份完成: $backupDir" -ForegroundColor Green
    
    # 2. 删除.git目录
    Write-Host "2. 删除Git历史..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
    
    # 3. 重新初始化Git
    Write-Host "3. 重新初始化Git..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: 二手交易应用 - 完整的安全配置和部署工具"
    
    # 4. 添加远程仓库
    Write-Host "4. 配置远程仓库..." -ForegroundColor Yellow
    git remote add origin https://github.com/LeeGeon-jin/second_hand_app.git
    
    # 5. 强制推送
    Write-Host "5. 强制推送新历史..." -ForegroundColor Yellow
    git push origin master --force
    
    Write-Host "`n✅ 深度清理完成！" -ForegroundColor Green
    Write-Host "所有敏感信息已从Git历史中完全移除" -ForegroundColor Green
    Write-Host "备份文件保存在: $backupDir" -ForegroundColor Cyan
    
} else {
    Write-Host "`n❌ 深度清理已取消" -ForegroundColor Red
}

Write-Host "`n📖 注意：所有协作者需要重新克隆仓库" -ForegroundColor Yellow
