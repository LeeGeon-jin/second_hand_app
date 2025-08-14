# 检查Git分支状态
Write-Host "当前目录: $(Get-Location)" -ForegroundColor Green
Write-Host "检查Git仓库..." -ForegroundColor Blue

if (Test-Path ".git") {
    Write-Host "Git仓库存在" -ForegroundColor Green
    
    Write-Host "`n=== 当前分支 ===" -ForegroundColor Yellow
    git branch --show-current
    
    Write-Host "`n=== 所有本地分支 ===" -ForegroundColor Yellow
    git branch
    
    Write-Host "`n=== 远程分支 ===" -ForegroundColor Yellow
    git branch -r
    
    Write-Host "`n=== 所有分支 ===" -ForegroundColor Yellow
    git branch -a
    
    Write-Host "`n=== Git状态 ===" -ForegroundColor Yellow
    git status --short
    
    Write-Host "`n=== 最近提交 ===" -ForegroundColor Yellow
    git log --oneline -5
} else {
    Write-Host "错误: 不是Git仓库" -ForegroundColor Red
}
