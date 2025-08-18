# 安全检查脚本
# 验证项目的安全配置是否正确

Write-Host "🔍 安全检查工具" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan

$issues = @()
$warnings = @()

# 检查.env文件是否被git忽略
Write-Host "`n1. 检查 .env 文件保护..." -ForegroundColor Yellow
$gitignore = Get-Content ".gitignore" -ErrorAction SilentlyContinue
if ($gitignore -contains ".env") {
    Write-Host "✅ .env 文件已正确添加到 .gitignore" -ForegroundColor Green
} else {
    $issues += ".env 文件未添加到 .gitignore"
    Write-Host "❌ .env 文件未添加到 .gitignore" -ForegroundColor Red
}

# 检查是否存在.env文件
$envFile = "backend\.env"
if (Test-Path $envFile) {
    Write-Host "✅ 发现 .env 文件" -ForegroundColor Green
    
    # 检查.env文件内容
    $envContent = Get-Content $envFile
    $hasMongoDB = $envContent | Where-Object { $_ -match "MONGODB_URI" }
    $hasJWT = $envContent | Where-Object { $_ -match "JWT_SECRET" }
    
    if ($hasMongoDB) {
        $mongoLine = $hasMongoDB | Select-Object -First 1
        if ($mongoLine -match "mongodb://localhost" -or $mongoLine -match "username:password") {
            $warnings += "MongoDB URI 可能使用默认值或示例值"
            Write-Host "⚠️  MongoDB URI 可能使用默认值或示例值" -ForegroundColor Yellow
        } else {
            Write-Host "✅ MongoDB URI 已配置" -ForegroundColor Green
        }
    } else {
        $issues += "MongoDB URI 未配置"
        Write-Host "❌ MongoDB URI 未配置" -ForegroundColor Red
    }
    
    if ($hasJWT) {
        $jwtLine = $hasJWT | Select-Object -First 1
        if ($jwtLine -match "your-super-secret" -or $jwtLine -match "secret") {
            $warnings += "JWT 密钥可能使用默认值或示例值"
            Write-Host "⚠️  JWT 密钥可能使用默认值或示例值" -ForegroundColor Yellow
        } else {
            Write-Host "✅ JWT 密钥已配置" -ForegroundColor Green
        }
    } else {
        $issues += "JWT 密钥未配置"
        Write-Host "❌ JWT 密钥未配置" -ForegroundColor Red
    }
} else {
    $warnings += ".env 文件不存在，请运行 setup-env.ps1"
    Write-Host "⚠️  .env 文件不存在，请运行 setup-env.ps1" -ForegroundColor Yellow
}

# 检查是否有硬编码的敏感信息
Write-Host "`n2. 检查硬编码敏感信息..." -ForegroundColor Yellow
$files = @("backend\server.js", "backend\routes\*.js", "backend\middleware\*.js")
$sensitivePatterns = @(
    "mongodb://[^'\s]+",
    "mongodb\+srv://[^'\s]+",
    "jwt\.sign.*secret",
    "password.*=.*['`"][^'`"]+['`"]",
    "api_key.*=.*['`"][^'`"]+['`"]"
)

$foundHardcoded = $false
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        foreach ($pattern in $sensitivePatterns) {
            $matches = $content | Select-String $pattern
            if ($matches) {
                $foundHardcoded = $true
                Write-Host "⚠️  在 $file 中发现可能的硬编码信息" -ForegroundColor Yellow
                break
            }
        }
    }
}

if (-not $foundHardcoded) {
    Write-Host "✅ 未发现硬编码的敏感信息" -ForegroundColor Green
}

# 检查环境变量使用
Write-Host "`n3. 检查环境变量使用..." -ForegroundColor Yellow
$serverContent = Get-Content "backend\server.js" -ErrorAction SilentlyContinue
if ($serverContent -match "process\.env\.MONGODB_URI") {
    Write-Host "✅ 正确使用环境变量获取MongoDB URI" -ForegroundColor Green
} else {
    $issues += "MongoDB URI 未使用环境变量"
    Write-Host "❌ MongoDB URI 未使用环境变量" -ForegroundColor Red
}

# 检查安全文档
Write-Host "`n4. 检查安全文档..." -ForegroundColor Yellow
if (Test-Path "SECURITY.md") {
    Write-Host "✅ 安全文档存在" -ForegroundColor Green
} else {
    $warnings += "缺少安全文档"
    Write-Host "⚠️  缺少安全文档" -ForegroundColor Yellow
}

if (Test-Path "backend\env.example") {
    Write-Host "✅ 环境变量示例文件存在" -ForegroundColor Green
} else {
    $warnings += "缺少环境变量示例文件"
    Write-Host "⚠️  缺少环境变量示例文件" -ForegroundColor Yellow
}

# 总结
Write-Host "`n📊 检查结果总结" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "🎉 安全检查通过！" -ForegroundColor Green
} else {
    Write-Host "❌ 发现 $($issues.Count) 个问题：" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  发现 $($warnings.Count) 个警告：" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
}

Write-Host "`n💡 建议：" -ForegroundColor Cyan
if ($issues.Count -gt 0) {
    Write-Host "请先解决上述问题，然后重新运行检查" -ForegroundColor White
}
if ($warnings.Count -gt 0) {
    Write-Host "建议处理上述警告以提高安全性" -ForegroundColor White
}
Write-Host "定期运行此检查以确保安全配置正确" -ForegroundColor White
Write-Host "详细安全指南请查看 SECURITY.md" -ForegroundColor White
