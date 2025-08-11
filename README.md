# 二手交易应用 (Second Hand Trading App)

一个专为澳洲新西兰市场设计的二手商品交易平台，支持用户发布、浏览、购买二手商品。

## 🌏 市场定位

- **目标市场**: 澳洲、新西兰
- **计价货币**: 澳元 (AUD)
- **语言支持**: 中文、英文

## 🚀 快速开始

### 环境要求
- Node.js 18+
- MongoDB 4.4+
- npm 或 yarn

### 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd frontend
npm install
```

### 环境配置
```bash
# 复制环境变量模板
cp backend/env.example backend/.env

# 编辑环境变量
# 必须配置：
# - MONGODB_URI: MongoDB连接字符串
# - JWT_SECRET: JWT密钥
# - PORT: 后端端口（默认5000）
```

### 启动开发服务器
```bash
# 一键启动（推荐）
.\start-dev.ps1

# 或分别启动
cd backend && npm start
cd frontend && npm run dev
```

访问 http://localhost:5173 查看应用

## 🔒 首次设置（团队成员）
```powershell
# 配置环境变量
.\setup-env.ps1
```

## 🔐 安全配置

### 环境变量保护
- 项目使用环境变量保护敏感信息（MongoDB URI、JWT密钥等）
- 新团队成员请运行 `.\setup-env.ps1` 配置本地环境
- 详细安全配置请查看 [SECURITY.md](./SECURITY.md)

### Git历史安全
- 运行 `.\check-git-history.ps1` 检查Git历史中的敏感信息
- 如果发现敏感信息泄漏，立即按照 [SECURITY.md](./SECURITY.md) 中的步骤处理
- 项目已配置pre-commit hooks防止敏感信息提交

### 团队协作
- 敏感信息通过安全渠道分享
- 定期更新密码和密钥
- 不要将 `.env` 文件提交到版本控制
- 定期运行安全检查脚本

## 📱 功能特性

### 用户功能
- 用户注册/登录
- 商品发布（支持图片上传）
- 商品浏览和搜索
- 分类筛选
- 聊天功能
- 个人中心

### 商品管理
- 多分类支持（电子产品、服装鞋帽、家居用品等）
- 图片上传和管理
- 价格设置（澳元计价）
- 位置信息
- 商品状态管理

### 安全特性
- AI内容审核
- 地址验证
- 价格估算
- 用户认证和授权

## 🛠️ 技术栈

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT认证
- AI服务集成

### 前端
- React + TypeScript
- Vite
- Ant Design Mobile
- Axios

## 📊 数据库

### 商品数据结构
```javascript
{
  title: String,           // 商品标题
  description: String,     // 商品描述
  price: Number,          // 价格（澳元）
  category: String,       // 分类
  images: [String],       // 图片URL数组
  location: {
    city: String,         // 城市
    district: String,     // 区域
    address: String       // 详细地址
  },
  seller: ObjectId,       // 卖家ID
  status: String,         // 状态（active/sold/inactive）
  createdAt: Date         // 创建时间
}
```

## 🚀 部署

### 本地部署
```bash
# 启动开发环境
.\start-dev.ps1
```

### 生产部署
详细部署指南请查看：
- [GoDaddy部署指南](./deploy-godaddy.md)
- [Netlify部署指南](./netlify-deploy-guide.md)

## 📝 开发规范

### 代码风格
- 使用ESLint和Prettier
- 遵循TypeScript规范
- 组件使用函数式组件和Hooks

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues
- 团队内部沟通渠道

---

**注意**: 本平台专为澳洲新西兰市场设计，所有商品价格均以澳元(AUD)计价。
