# FTP上传脚本 - 上传到GoDaddy共享主机

param(
    [Parameter(Mandatory=$true)]
    [string]$FtpServer,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/public_html/"
)

Write-Host "🚀 开始FTP上传到GoDaddy..." -ForegroundColor Green

# 检查部署文件是否存在
if (-not (Test-Path "deploy/frontend")) {
    Write-Host "❌ 部署文件不存在，请先运行 deploy.ps1" -ForegroundColor Red
    exit 1
}

# 创建FTP请求
$ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$FtpServer$RemotePath")
$ftpRequest.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
$ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
$ftpRequest.UsePassive = $true
$ftpRequest.UseBinary = $true
$ftpRequest.KeepAlive = $false

# 上传文件函数
function Upload-File {
    param([string]$LocalPath, [string]$RemotePath)
    
    try {
        Write-Host "📤 上传: $LocalPath -> $RemotePath" -ForegroundColor Yellow
        
        $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$FtpServer$RemotePath")
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.UsePassive = $true
        $ftpRequest.UseBinary = $true
        $ftpRequest.KeepAlive = $false
        
        $fileStream = [System.IO.File]::OpenRead($LocalPath)
        $ftpStream = $ftpRequest.GetRequestStream()
        
        $buffer = New-Object byte[] 8192
        $bytesRead = 0
        
        while (($bytesRead = $fileStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $ftpStream.Write($buffer, 0, $bytesRead)
        }
        
        $ftpStream.Close()
        $fileStream.Close()
        
        Write-Host "✅ 上传成功: $LocalPath" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 上传失败: $LocalPath - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 上传前端文件
Write-Host "📁 上传前端文件..." -ForegroundColor Yellow
$frontendFiles = Get-ChildItem -Path "deploy/frontend" -Recurse -File

foreach ($file in $frontendFiles) {
    $relativePath = $file.FullName.Replace("$PWD\deploy\frontend\", "")
    $remotePath = "$RemotePath$relativePath"
    Upload-File -LocalPath $file.FullName -RemotePath $remotePath
}

Write-Host "🎉 FTP上传完成！" -ForegroundColor Green
Write-Host "💡 请检查你的GoDaddy网站是否正常显示" -ForegroundColor Cyan

