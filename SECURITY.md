# 安全配置指南

## 🔒 敏感信息保护

### MongoDB URI 保护

本项目使用环境变量来保护MongoDB连接字符串，确保只有团队成员可以访问。

#### 开发环境配置

1. 在 `backend/` 目录下创建 `.env` 文件：
```bash
cd backend
cp env.example .env
```

2. 编辑 `.env` 文件，填入真实的配置信息：
```env
MONGODB_URI=mongodb://your-username:your-password@your-host:port/your-database
JWT_SECRET=your-super-secret-jwt-key
```

#### 生产环境配置

在生产环境中，通过以下方式配置环境变量：

**Heroku:**
```bash
heroku config:set MONGODB_URI="your-mongodb-connection-string"
heroku config:set JWT_SECRET="your-jwt-secret"
```

**Railway:**
- 在Railway控制台中设置环境变量

**Render:**
- 在Render控制台的Environment Variables中设置

**Vercel:**
- 在Vercel项目设置中添加环境变量

### 安全最佳实践

#### 1. 环境变量管理
- ✅ 使用环境变量存储敏感信息
- ✅ 将 `.env` 文件添加到 `.gitignore`
- ✅ 为团队提供 `env.example` 作为模板
- ❌ 不要在代码中硬编码敏感信息
- ❌ 不要将 `.env` 文件提交到版本控制

#### 2. 数据库安全
- 使用强密码
- 启用数据库访问控制
- 限制网络访问（IP白名单）
- 定期备份数据
- 使用SSL/TLS连接

#### 3. JWT密钥安全
- 使用强随机字符串作为JWT密钥
- 定期轮换JWT密钥
- 设置合理的token过期时间

#### 4. API安全
- 使用HTTPS
- 实施速率限制
- 验证所有输入
- 使用CORS保护

### 团队协作

#### 新成员加入
1. 提供 `env.example` 文件
2. 说明如何配置本地环境
3. 提供生产环境访问权限

#### 环境变量共享
- 使用安全的密码管理器
- 通过加密通信渠道分享
- 定期更新敏感信息

### 监控和审计

#### 日志记录
- 记录数据库连接状态
- 记录API访问日志
- 监控异常访问模式

#### 定期检查
- 检查环境变量配置
- 审查访问权限
- 更新安全策略

## 🚨 紧急情况

### 敏感信息泄露处理

如果发现敏感信息泄露：

1. 立即更改所有相关密码
2. 轮换JWT密钥
3. 检查访问日志
4. 通知团队成员
5. 更新安全配置

### Git历史中的敏感信息

如果发现敏感信息被提交到Git历史中：

1. **立即更改所有相关密钥和密码**
2. **清理Git历史**：
   ```bash
   # 使用 git filter-branch 移除敏感文件
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch backend/.env' \
   --prune-empty --tag-name-filter cat -- --all
   
   # 或者使用 BFG Repo-Cleaner（推荐）
   # 下载 BFG: https://rtyley.github.io/bfg-repo-cleaner/
   java -jar bfg.jar --delete-files .env
   ```

3. **强制推送清理后的历史**：
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

4. **通知所有协作者**：
   - 删除本地仓库
   - 重新克隆清理后的仓库
   - 重新配置环境变量

5. **设置预防措施**：
   - 配置 pre-commit hooks
   - 使用 git-secrets 工具
   - 定期运行安全检查

### 检查Git历史安全

运行安全检查脚本：
```powershell
.\check-git-history.ps1
```

## 📞 联系信息

如有安全问题，请联系项目管理员。
