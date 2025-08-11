# 部署脚本使用说明

## 📁 脚本文件

- `deploy-all.ps1` - 完整的一键部署脚本 (PowerShell)
- `deploy-all.bat` - 简化版部署脚本 (双击运行)
- `quick-fix.ps1` - 快速修复和部署脚本

## 🚀 使用方法

### 方法1：双击运行 (推荐)
```bash
# 双击运行 deploy-all.bat
# 然后选择部署模式
```

### 方法2：命令行运行
```bash
# 部署到在线和本地服务器
.\deploy-all.ps1

# 只部署到在线服务器
.\deploy-all.ps1 -OnlineOnly

# 只部署到本地服务器
.\deploy-all.ps1 -LocalOnly

# 跳过构建步骤
.\deploy-all.ps1 -SkipBuild

# 快速修复样式问题
.\quick-fix.ps1
```

## 📋 部署选项

### 1. 完整部署 (默认)
- ✅ 构建前端项目
- ✅ 部署到 Railway 在线服务器
- ✅ 启动本地开发服务器
- ✅ 自动打开浏览器

### 2. 仅在线部署
- ✅ 构建前端项目
- ✅ 部署到 Railway 在线服务器
- ❌ 不启动本地服务器

### 3. 仅本地部署
- ✅ 构建前端项目
- ❌ 不部署到在线服务器
- ✅ 启动本地开发服务器

### 4. 快速修复
- ✅ 构建前端项目
- ✅ 部署到 Railway 在线服务器
- ❌ 不启动本地服务器
- ⚡ 专门用于修复样式问题

## 🌐 服务器地址

### 在线服务器
- **前端**: https://secondhand-production-328f.up.railway.app
- **后端**: https://secondhand-production.up.railway.app
- **自定义域名**: https://auwei.net (需要配置DNS)

### 本地服务器
- **前端**: http://localhost:5173
- **后端**: http://localhost:5000

## ⚠️ 注意事项

### 部署前检查
1. 确保已安装 Node.js
2. 确保已安装 Railway CLI (`npm install -g @railway/cli`)
3. 确保已登录 Railway (`railway login`)

### 常见问题
1. **端口占用**: 脚本会自动清理占用的端口
2. **构建失败**: 检查前端代码是否有语法错误
3. **部署失败**: 检查网络连接和 Railway 登录状态

### DNS 配置
如果使用自定义域名，需要在 GoDaddy 配置 DNS 记录：
- **CNAME**: @ → 4hkony1p.up.railway.app
- **CNAME**: api → 66uf61pn.up.railway.app

## 🔧 故障排除

### 如果脚本运行失败
1. 检查 PowerShell 执行策略：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
2. 确保在项目根目录运行脚本
3. 检查是否有未提交的代码更改

### 如果在线服务器无法访问
1. 检查 Railway 项目状态
2. 查看 Railway 日志：`railway logs`
3. 重新部署：`railway up`

### 如果本地服务器无法启动
1. 检查端口是否被占用
2. 检查 Node.js 版本
3. 重新安装依赖：`npm install`

## 📝 更新日志

- **v1.0**: 初始版本，支持在线和本地部署
- **v1.1**: 添加快速修复脚本
- **v1.2**: 修复卡片间距问题
- **v1.3**: 添加批处理文件支持
