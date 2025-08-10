# 清理Git历史中的敏感信息
# 这是一个紧急安全脚本

Write-Host "🚨 紧急安全清理" -ForegroundColor Red
Write-Host "========================" -ForegroundColor Red

Write-Host "⚠️  警告：发现Git历史中有真实的MongoDB连接字符串！" -ForegroundColor Yellow
Write-Host "请立即执行以下步骤：" -ForegroundColor Yellow

Write-Host "`n1. 立即更改MongoDB密码：" -ForegroundColor Cyan
Write-Host "   - 登录 MongoDB Atlas" -ForegroundColor White
Write-Host "   - 更改用户 liqianchen1211 的密码" -ForegroundColor White
Write-Host "   - 或创建新的数据库用户" -ForegroundColor White

Write-Host "`n2. 清理Git历史：" -ForegroundColor Cyan
Write-Host "   - 使用 git filter-branch 移除敏感信息" -ForegroundColor White
Write-Host "   - 强制推送清理后的历史" -ForegroundColor White

Write-Host "`n3. 通知团队成员：" -ForegroundColor Cyan
Write-Host "   - 删除本地仓库" -ForegroundColor White
Write-Host "   - 重新克隆清理后的仓库" -ForegroundColor White

Write-Host "`n是否要立即开始清理Git历史？(y/n)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "`n开始清理Git历史..." -ForegroundColor Green
    
    # 备份当前状态
    Write-Host "备份当前状态..." -ForegroundColor Yellow
    git branch backup-before-cleanup
    
    # 使用 git filter-branch 清理历史
    Write-Host "清理包含敏感信息的提交..." -ForegroundColor Yellow
    git filter-branch --force --index-filter `
    'git rm --cached --ignore-unmatch backend/server.js deploy/backend/server.js' `
    --prune-empty --tag-name-filter cat -- --all
    
    Write-Host "`n✅ Git历史清理完成" -ForegroundColor Green
    Write-Host "下一步：" -ForegroundColor Cyan
    Write-Host "1. 更改MongoDB密码" -ForegroundColor White
    Write-Host "2. 运行: git push origin --force --all" -ForegroundColor White
    Write-Host "3. 通知团队成员更新本地仓库" -ForegroundColor White
} else {
    Write-Host "`n❌ 清理已取消" -ForegroundColor Red
    Write-Host "请手动执行安全清理步骤" -ForegroundColor Yellow
}

Write-Host "`n📖 详细步骤请查看 SECURITY.md" -ForegroundColor Cyan
