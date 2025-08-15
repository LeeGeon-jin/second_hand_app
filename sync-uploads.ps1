# 同步uploads目录到Railway
Write-Host "🔄 同步uploads目录到Railway..." -ForegroundColor Yellow

# 检查uploads目录是否存在
if (!(Test-Path "backend/uploads")) {
    Write-Host "❌ backend/uploads目录不存在" -ForegroundColor Red
    exit 1
}

# 获取uploads目录中的文件
$uploadFiles = Get-ChildItem "backend/uploads" -File | Where-Object { $_.Name -ne ".gitkeep" }

if ($uploadFiles.Count -eq 0) {
    Write-Host "⚠️  uploads目录中没有文件" -ForegroundColor Yellow
    exit 0
}

Write-Host "📁 发现 $($uploadFiles.Count) 个文件需要同步" -ForegroundColor Green

# 切换到backend目录
Set-Location "backend"

# 使用railway命令同步文件
Write-Host "🚀 开始同步文件到Railway..." -ForegroundColor Yellow

try {
    # 先确保uploads目录存在
    railway service second_hand
    
    # 同步uploads目录
    Write-Host "正在同步uploads目录..." -ForegroundColor Gray
    railway up --detach
    
    Write-Host "✅ 文件同步完成" -ForegroundColor Green
    
} catch {
    Write-Host "❌ 同步失败: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Set-Location ".."
}

Write-Host "`n📝 注意：Railway可能需要几分钟时间来同步文件" -ForegroundColor Cyan
Write-Host "💡 如果图片仍然无法显示，请等待几分钟后刷新页面" -ForegroundColor Cyan
