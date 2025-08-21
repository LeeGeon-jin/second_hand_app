# 环境变量设置脚本
# 帮助团队成员安全地配置本地开发环境

Write-Host "🔒 环境变量配置助手" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# 检查是否已存在.env文件
$envFile = "backend\.env"
if (Test-Path $envFile) {
    Write-Host "⚠️  发现已存在的 .env 文件" -ForegroundColor Yellow
    $response = Read-Host "是否要备份并重新创建？(y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $backupFile = "backend\.env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $envFile $backupFile
        Write-Host "✅ 已备份到: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "❌ 操作已取消" -ForegroundColor Red
        exit
    }
}

# 创建.env文件
Write-Host "`n📝 创建环境变量文件..." -ForegroundColor Yellow

$envContent = @"
# 数据库配置
# 请从团队管理员获取真实的MongoDB连接字符串
MONGODB_URI=mongodb://username:password@host:port/database

# JWT密钥
# 请使用强随机字符串，至少32位
JWT_SECRET=your-super-secret-jwt-key-here

# 服务器配置
PORT=5000
NODE_ENV=development

# AI服务配置（可选）
# 如果需要使用AI功能，请配置以下密钥
OPENAI_API_KEY=your-openai-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
COHERE_API_KEY=your-cohere-api-key

# 短信服务配置（可选）
# 如果需要短信验证功能，请配置以下密钥
SMS_API_KEY=your-sms-api-key
SMS_SECRET=your-sms-secret

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
"@

$envContent | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "✅ 已创建 $envFile" -ForegroundColor Green

# 显示配置说明
Write-Host "`n📋 配置说明：" -ForegroundColor Cyan
Write-Host "1. 编辑 $envFile 文件" -ForegroundColor White
Write-Host "2. 将示例值替换为真实的配置信息" -ForegroundColor White
Write-Host "3. 保存文件后重启开发服务器" -ForegroundColor White

Write-Host "`n🔐 安全提醒：" -ForegroundColor Yellow
Write-Host "- 不要将 .env 文件提交到版本控制" -ForegroundColor White
Write-Host "- 不要将敏感信息分享给非团队成员" -ForegroundColor White
Write-Host "- 定期更新密码和密钥" -ForegroundColor White

Write-Host "`n📖 更多信息请查看 SECURITY.md" -ForegroundColor Cyan

# 询问是否立即编辑文件
$editResponse = Read-Host "`n是否立即打开 .env 文件进行编辑？(y/n)"
if ($editResponse -eq 'y' -or $editResponse -eq 'Y') {
    notepad $envFile
}

Write-Host "`n🎉 环境变量配置完成！" -ForegroundColor Green
