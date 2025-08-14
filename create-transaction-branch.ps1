# 创建交易系统功能分支并推送到GitHub
Write-Host "=== 创建交易系统功能分支 ===" -ForegroundColor Green

# 确保在正确的目录
Set-Location "c:\projects\second_hand_app"
Write-Host "当前目录: $(Get-Location)" -ForegroundColor Blue

# 检查当前状态
Write-Host "`n检查Git状态..." -ForegroundColor Yellow
git status

# 创建并切换到新分支
Write-Host "`n创建新分支 feature/transaction-system..." -ForegroundColor Yellow
git checkout -b feature/transaction-system

# 确认分支创建成功
Write-Host "`n当前分支:" -ForegroundColor Yellow
git branch --show-current

# 添加所有更改
Write-Host "`n添加所有更改到暂存区..." -ForegroundColor Yellow
git add .

# 查看将要提交的文件
Write-Host "`n将要提交的文件:" -ForegroundColor Yellow
git status --short

# 提交更改
Write-Host "`n提交交易系统功能..." -ForegroundColor Yellow
$commitMessage = @"
feat: 实现完整的双方确认交易系统和评价功能

🚀 新功能:
- 双方确认交易完成机制 (买家和卖家都需要确认)
- 交易完成后的评分系统 (1-5星+评论)
- 完整的商品管理功能 (上架/下架/删除)
- 交易历史记录查看
- 用户个人中心升级

🏗️ 后端API:
- 新增交易路由 (/api/transactions)
  - 开始交易: POST /start/:productId
  - 确认完成: POST /confirm/:productId  
  - 取消交易: POST /cancel/:productId
  - 评分功能: POST /rate/:productId
  - 交易记录: GET /my-transactions
- 增强产品模型支持交易状态和评分
- 商品管理API (下架/重新上架/删除)

💻 前端组件:
- TransactionButtons: 交易管理按钮组件
- StartTransactionButton: 开始交易按钮
- TransactionHistory: 交易历史记录页面
- MyProducts: 我的商品管理页面 (升级)
- UserProfile: 个人中心菜单 (升级)

🎯 核心特性:
- 商品状态: active → pending_completion → sold
- 双方确认: buyerConfirmed & sellerConfirmed
- 评分保留: 买家卖家各自评分存储
- 数据完整: 交易记录永久保存
- 用户体验: 清晰的状态提示和操作流程

✨ 技术实现:
- TypeScript类型安全
- Ant Design UI组件
- MongoDB数据持久化  
- JWT用户认证
- 响应式设计
"@

git commit -m $commitMessage

# 推送到远程仓库
Write-Host "`n推送分支到GitHub..." -ForegroundColor Yellow
git push -u origin feature/transaction-system

# 确认推送结果
Write-Host "`n=== 操作完成 ===" -ForegroundColor Green
Write-Host "分支已创建并推送到GitHub: feature/transaction-system" -ForegroundColor Cyan
Write-Host "远程仓库: https://github.com/LeeGeon-jin/second_hand_app" -ForegroundColor Cyan

# 显示最终状态
Write-Host "`n当前所有分支:" -ForegroundColor Yellow
git branch -a

Write-Host "`n最近的提交:" -ForegroundColor Yellow
git log --oneline -3

Write-Host "`n操作完成！可以在GitHub上创建Pull Request了。" -ForegroundColor Green
