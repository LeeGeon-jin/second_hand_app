# 部署脚本使用说明

本项目提供了多个部署脚本，可以根据需要选择使用：

## 🚀 脚本列表

### 1. `deploy-all.ps1` - 完整部署脚本
**功能**: 构建前端 + 部署到在线服务器 + 启动本地服务器
**使用场景**: 首次部署或需要完整环境时使用

```powershell
# 完整部署（构建+在线+本地）
.\deploy-all.ps1

# 只部署到在线服务器
.\deploy-all.ps1 -OnlineOnly

# 只启动本地服务器
.\deploy-all.ps1 -LocalOnly

# 跳过构建步骤
.\deploy-all.ps1 -SkipBuild
```

### 2. `deploy-online.ps1` - 在线部署脚本 ⭐ **推荐**
**功能**: 构建前端 + 部署到在线服务器（不启动本地）
**使用场景**: 日常更新时使用，本地开发服务器通常会自动刷新

```powershell
# 构建并部署到在线
.\deploy-online.ps1

# 跳过构建，直接部署（如果前端代码没改）
.\deploy-online.ps1 -SkipBuild
```

### 3. `deploy-backend.ps1` - 快速后端部署脚本 ⚡ **最快**
**功能**: 只部署后端到在线服务器
**使用场景**: 只修改了后端代码时使用，速度最快

```powershell
# 快速部署后端
.\deploy-backend.ps1
```

## 📋 使用建议

### 日常开发流程：
1. **修改代码** → 本地测试
2. **后端更新** → `.\deploy-backend.ps1` ⚡
3. **前端更新** → `.\deploy-online.ps1` ⭐
4. **重大更新** → `.\deploy-all.ps1`

### 为什么推荐 `deploy-online.ps1`？
- ✅ 本地开发服务器通常会自动刷新，不需要重启
- ✅ 只部署到在线，避免本地端口冲突
- ✅ 包含前端构建，确保最新代码
- ✅ 验证部署状态，确保服务正常运行

### 什么时候使用 `deploy-backend.ps1`？
- 🔧 只修改了后端API
- 🔧 添加了新的路由或模型
- 🔧 修复了后端bug
- ⚡ 速度最快，约5-10分钟完成

## 🌐 在线服务地址

- **前端**: https://secondhand-production-328f.up.railway.app
- **后端**: https://secondhand-production.up.railway.app
- **自定义域名**: https://auwei.net (需要配置DNS)

## ⚠️ 注意事项

1. **CLI连接中断**: 这是正常现象，不影响实际部署
2. **部署时间**: 通常需要5-15分钟，取决于代码变更大小
3. **DNS传播**: 自定义域名可能需要15-60分钟生效
4. **本地开发**: 建议使用 `npm run dev` 启动本地开发服务器

## 🔧 故障排除

### 如果部署失败：
1. 检查网络连接
2. 确认 Railway CLI 已安装
3. 检查代码是否有语法错误
4. 查看 Railway 控制台的构建日志

### 如果服务无法访问：
1. 等待5-10分钟让部署完成
2. 检查 Railway 控制台的服务状态
3. 确认环境变量配置正确
