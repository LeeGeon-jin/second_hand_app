# 安全清理脚本 - 只清理master分支
# 保留组员的分支和工作

Write-Host "🔒 安全清理master分支" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan

Write-Host "⚠️  注意：此脚本只清理master分支的敏感信息" -ForegroundColor Yellow
Write-Host "组员的分支将被保留" -ForegroundColor Yellow

$response = Read-Host "`n是否继续？(y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "`n开始安全清理..." -ForegroundColor Green
    
    # 1. 备份当前master分支
    Write-Host "1. 备份当前master分支..." -ForegroundColor Yellow
    git branch backup-master-$(Get-Date -Format 'yyyyMMdd-HHmmss')
    
    # 2. 创建一个新的干净master分支
    Write-Host "2. 创建新的干净master分支..." -ForegroundColor Yellow
    
    # 删除当前master分支（本地）
    git checkout backup-before-cleanup
    git branch -D master
    
    # 从备份分支创建新的master分支
    git checkout -b master
    git add .
    git commit -m "feat: 二手交易应用 - 完整的安全配置和部署工具 - 使用环境变量保护敏感信息 - 添加安全检查脚本和工具 - 完善安全文档和部署指南"
    
    # 3. 强制推送新的master分支
    Write-Host "3. 推送新的master分支..." -ForegroundColor Yellow
    git push origin master --force
    
    Write-Host "`n✅ 安全清理完成！" -ForegroundColor Green
    Write-Host "master分支已清理，组员分支已保留" -ForegroundColor Green
    
} else {
    Write-Host "`n❌ 清理已取消" -ForegroundColor Red
}

Write-Host "`n📖 建议：" -ForegroundColor Cyan
Write-Host "- 通知组员检查他们的分支是否有敏感信息" -ForegroundColor White
Write-Host "- 如果组员分支有敏感信息，让他们手动清理" -ForegroundColor White
Write-Host "- 或者使用 git filter-branch 清理特定分支" -ForegroundColor White
