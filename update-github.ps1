# 一键更新到GitHub脚本
# 使用方法: 右键用 PowerShell 运行，或在终端输入 .\update-github.ps1

param(
    [string]$CommitMessage = "",    # 自定义提交信息
    [switch]$Force,                 # 强制推送
    [switch]$SkipCheck,             # 跳过更改检查
    [switch]$SkipSecurityCheck      # 跳过安全检查
)

Write-Host "🚀 一键更新到GitHub脚本启动..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# 检查Git是否安装
try {
    $gitVersion = git --version 2>$null
    Write-Host "✅ Git已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git未安装，请先安装Git" -ForegroundColor Red
    exit 1
}

# 检查是否在Git仓库中
if (!(Test-Path ".git")) {
    Write-Host "❌ 当前目录不是Git仓库" -ForegroundColor Red
    exit 1
}

# 检查远程仓库
$remoteUrl = git remote get-url origin 2>$null
if (!$remoteUrl) {
    Write-Host "❌ 未配置远程仓库，请先添加origin" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 远程仓库: $remoteUrl" -ForegroundColor Green

# 检查当前分支
$currentBranch = git branch --show-current
Write-Host "✅ 当前分支: $currentBranch" -ForegroundColor Green

# 检查是否有未提交的更改
if (!$SkipCheck) {
    Write-Host "`n📋 检查文件更改..." -ForegroundColor Yellow
    $gitStatus = git status --porcelain 2>$null
    
    if (!$gitStatus) {
        Write-Host "✅ 没有需要提交的更改" -ForegroundColor Green
        Write-Host "`n🎉 无需更新GitHub" -ForegroundColor Green
        exit 0
    }
    
    Write-Host "发现以下更改:" -ForegroundColor Yellow
    $gitStatus | ForEach-Object {
        $status = $_.Substring(0, 2)
        $file = $_.Substring(3)
        switch ($status) {
            "M " { Write-Host "  📝 修改: $file" -ForegroundColor Blue }
            "A " { Write-Host "  ➕ 新增: $file" -ForegroundColor Green }
            "D " { Write-Host "  ❌ 删除: $file" -ForegroundColor Red }
            "R " { Write-Host "  🔄 重命名: $file" -ForegroundColor Yellow }
            default { Write-Host "  ❓ 其他: $file" -ForegroundColor Gray }
        }
    }
    
    # 运行安全检查
    if (!$SkipSecurityCheck) {
        Write-Host "`n🔒 运行安全检查..." -ForegroundColor Yellow
        if (Test-Path "security-check.ps1") {
            & ".\security-check.ps1"
            Write-Host "`n⚠️  请确认上述安全检查结果，如有问题请先修复" -ForegroundColor Yellow
            $continue = Read-Host "是否继续提交？(y/N)"
            if ($continue -ne "y" -and $continue -ne "Y") {
                Write-Host "❌ 用户取消提交" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "⚠️  未找到 security-check.ps1，跳过安全检查" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n⚠️  跳过安全检查（使用 -SkipSecurityCheck 参数）" -ForegroundColor Yellow
    }
}

# 获取提交信息
if (!$CommitMessage) {
    Write-Host "`n💬 请输入提交信息:" -ForegroundColor Yellow
    Write-Host "  格式建议: 修复了什么功能/添加了什么特性/优化了什么" -ForegroundColor Gray
    $CommitMessage = Read-Host "提交信息"
    
    if (!$CommitMessage) {
        Write-Host "❌ 提交信息不能为空" -ForegroundColor Red
        exit 1
    }
}

# 添加所有更改
Write-Host "`n📦 添加文件到暂存区..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 添加文件失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 文件已添加到暂存区" -ForegroundColor Green

# 提交更改
Write-Host "`n💾 提交更改..." -ForegroundColor Yellow
git commit -m "$CommitMessage" --no-verify
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 提交失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 更改已提交: $CommitMessage" -ForegroundColor Green

# 推送到远程仓库
Write-Host "`n🚀 推送到GitHub..." -ForegroundColor Yellow
if ($Force) {
    git push origin $currentBranch --force
} else {
    git push origin $currentBranch
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失败" -ForegroundColor Red
    Write-Host "💡 提示: 如果遇到冲突，可以使用 -Force 参数强制推送" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 成功推送到GitHub" -ForegroundColor Green

# 显示提交信息
Write-Host "`n📊 提交统计:" -ForegroundColor Cyan
$commitHash = git rev-parse HEAD
$commitHashShort = $commitHash.Substring(0, 7)
Write-Host "  提交哈希: $commitHashShort" -ForegroundColor White
Write-Host "  提交信息: $CommitMessage" -ForegroundColor White
Write-Host "  分支: $currentBranch" -ForegroundColor White
Write-Host "  远程仓库: $remoteUrl" -ForegroundColor White

Write-Host "`n🎉 更新完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ 所有更改已成功推送到GitHub" -ForegroundColor White
Write-Host "🌐 可以在GitHub上查看最新代码" -ForegroundColor White

Write-Host "`n📝 使用说明：" -ForegroundColor Cyan
Write-Host "  .\update-github.ps1                    # 交互式更新（包含安全检查）" -ForegroundColor White
Write-Host "  .\update-github.ps1 -CommitMessage '修复bug'" -ForegroundColor White
Write-Host "  .\update-github.ps1 -Force            # 强制推送" -ForegroundColor White
Write-Host "  .\update-github.ps1 -SkipCheck        # 跳过更改检查" -ForegroundColor White
Write-Host "  .\update-github.ps1 -SkipSecurityCheck # 跳过安全检查" -ForegroundColor White
