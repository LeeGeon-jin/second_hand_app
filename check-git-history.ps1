# Git历史安全检查脚本
# 检查Git历史中是否有敏感信息泄漏

Write-Host "🔍 Git历史安全检查" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan

# 检查Git仓库状态
Write-Host "`n1. 检查Git仓库状态..." -ForegroundColor Yellow
try {
    $gitStatus = git status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Git仓库正常" -ForegroundColor Green
    } else {
        Write-Host "❌ Git仓库有问题，可能不是Git仓库" -ForegroundColor Red
        Write-Host "建议：如果这是Git仓库，请检查.git目录是否存在" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ 无法检查Git状态" -ForegroundColor Red
    exit 1
}

# 检查是否有敏感信息在历史中
Write-Host "`n2. 检查Git历史中的敏感信息..." -ForegroundColor Yellow

$sensitivePatterns = @(
    "mongodb://[^'\s]+@[^'\s]+",
    "mongodb\+srv://[^'\s]+@[^'\s]+",
    "password.*=.*['`"][^'`"]{8,}['`"]",
    "api_key.*=.*['`"][^'`"]{8,}['`"]",
    "secret.*=.*['`"][^'`"]{8,}['`"]",
    "token.*=.*['`"][^'`"]{8,}['`"]"
)

$foundSensitive = $false

foreach ($pattern in $sensitivePatterns) {
    try {
        $matches = git log -p --all | Select-String $pattern -AllMatches
        if ($matches) {
            $foundSensitive = $true
            Write-Host "⚠️  发现可能的敏感信息模式: $pattern" -ForegroundColor Yellow
            foreach ($match in $matches) {
                Write-Host "   文件: $($match.Filename), 行: $($match.LineNumber)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "⚠️  无法检查模式: $pattern" -ForegroundColor Yellow
    }
}

if (-not $foundSensitive) {
    Write-Host "✅ 未在Git历史中发现明显的敏感信息" -ForegroundColor Green
}

# 检查最近的提交
Write-Host "`n3. 检查最近的提交..." -ForegroundColor Yellow
try {
    $recentCommits = git log --oneline -5 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "最近的5个提交:" -ForegroundColor Cyan
        foreach ($commit in $recentCommits) {
            Write-Host "  $commit" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️  无法获取提交历史" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  无法检查提交历史" -ForegroundColor Yellow
}

# 检查是否有.env文件被提交过
Write-Host "`n4. 检查.env文件提交历史..." -ForegroundColor Yellow
try {
    $envCommits = git log --oneline --all --full-history -- "*.env" 2>&1
    if ($LASTEXITCODE -eq 0 -and $envCommits) {
        Write-Host "⚠️  发现.env文件被提交过:" -ForegroundColor Red
        foreach ($commit in $envCommits) {
            Write-Host "  $commit" -ForegroundColor Red
        }
        Write-Host "建议：立即从Git历史中移除.env文件" -ForegroundColor Yellow
    } else {
        Write-Host "✅ 未发现.env文件被提交" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  无法检查.env文件历史" -ForegroundColor Yellow
}

# 检查是否有包含敏感信息的文件被提交
Write-Host "`n5. 检查敏感文件提交历史..." -ForegroundColor Yellow
$sensitiveFiles = @("*.key", "*.pem", "*.p12", "*.pfx", "config.json", "secrets.json")
foreach ($file in $sensitiveFiles) {
    try {
        $fileCommits = git log --oneline --all --full-history -- "$file" 2>&1
        if ($LASTEXITCODE -eq 0 -and $fileCommits) {
            Write-Host "⚠️  发现敏感文件被提交: $file" -ForegroundColor Red
            foreach ($commit in $fileCommits) {
                Write-Host "  $commit" -ForegroundColor Red
            }
        }
    } catch {
        # 忽略错误
    }
}

Write-Host "`n📊 检查结果总结" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

if ($foundSensitive) {
    Write-Host "❌ 发现潜在的敏感信息泄漏" -ForegroundColor Red
    Write-Host "建议立即采取行动：" -ForegroundColor Yellow
    Write-Host "1. 更改所有相关密码和密钥" -ForegroundColor White
    Write-Host "2. 使用 git filter-branch 或 BFG Repo-Cleaner 清理历史" -ForegroundColor White
    Write-Host "3. 强制推送更新后的历史" -ForegroundColor White
    Write-Host "4. 通知所有协作者更新本地仓库" -ForegroundColor White
} else {
    Write-Host "✅ Git历史安全检查通过" -ForegroundColor Green
}

Write-Host "`n💡 安全建议：" -ForegroundColor Cyan
Write-Host "- 定期运行此检查" -ForegroundColor White
Write-Host "- 使用 pre-commit hooks 防止敏感信息提交" -ForegroundColor White
Write-Host "- 考虑使用 git-secrets 工具" -ForegroundColor White
Write-Host "- 定期轮换密钥和密码" -ForegroundColor White
