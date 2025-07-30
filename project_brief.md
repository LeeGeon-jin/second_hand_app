# 同城面交二手交易平台项目概述

## 1. 项目核心理念
本平台旨在构建一个安全、高效、便捷的同城二手商品交易社区。我们专注于线下当面交易（面交），通过提供基于地理位置的商品展示、完善的用户沟通工具和强化的信誉体系，促进用户之间一手交钱一手交货的私下交易。平台不介入支付和物流，最大程度规避线上交易带来的争议，并增强用户间的信任。

## 2. 关键特性与用户旅程
### A. 商品的发布与浏览
- 同城定位与筛选：用户可自动定位或手动选择城市/区县，优先浏览附近商品。支持按距离、分类、价格、发布时间等筛选。
- 发布商品：卖家需提供商品标题、多图、详细描述、分类、精确到区/县的商品位置、价格，并明确交易方式为“面交”。
- 商品详情：展示商品图片、详细描述、价格、明确的面交位置、卖家昵称、信誉评分，以及“联系卖家”和“举报”按钮。

### B. 用户交互与安全交易
- 用户账户：包含注册/登录、个人资料编辑、实名认证（可选，但强烈推荐以提升信任度）。
- 私信沟通：买卖双方可通过站内信协商商品详情、面交时间、地点及具体支付方式（现金或当面转账）。可支持图片发送。
- 面交安全提示：平台在关键环节（如发帖、私信）提醒用户选择公共场所面交，注意人身财产安全，并强调“先验货，后付款”原则。
- 交易记录：用户可在个人中心查看自己作为买家和卖家的历史交易记录。
- 信誉评价：交易完成后（用户双方确认），买卖双方可互相评价，积累信誉和好评率。

### C. 平台管理与维护
- 管理员后台：用于对用户、商品、举报等进行集中管理。
- 用户管理：查看所有用户详情、发布商品、交易历史、被举报记录，可进行账号禁用/启用等操作。
- 商品管理：审核、下架、删除违规商品，管理商品分类。
- 举报与争议处理：集中处理所有用户举报，查看证据，并对违规行为进行警告或处罚。
- 安全指南：提供详细的面交安全指南和防骗须知，教育用户规避风险。

## 3. 技术栈建议 (供Copilot参考)
- 前端框架: React / Vue.js (选择其中之一)
- 状态管理: Redux / Vuex (根据前端框架选择)
- UI 组件库: Ant Design / Element UI / Material-UI (根据前端框架选择)
- 后端语言/框架: Node.js (Express.js) / Python (Django 或 Flask) (选择其中之一)
- 数据库: MongoDB (NoSQL, 灵活) / PostgreSQL (关系型, 严谨)
- 地理位置服务: Google Maps API / 高德地图 API / 百度地图 API (根据实际需求和地域选择)
- 实时通信: Socket.IO (用于私信聊天功能，如果需要实时性)

## 4. 待开发模块列表 (可作为Copilot任务导向)

### 前端模块：
- 用户认证: components/Auth/Login.js, components/Auth/Register.js
- 主页商品列表: components/ProductList/ProductList.js, components/ProductList/ProductCard.js
- 商品详情页: components/ProductDetail/ProductDetail.js
- 发布商品表单: components/ProductForm/ProductForm.js
- 个人中心: components/Profile/UserProfile.js, components/Profile/MyProducts.js, components/Profile/MyChats.js, components/Profile/MyRatings.js
- 私信聊天界面: components/Chat/ChatWindow.js, components/Chat/ChatList.js
- 通用UI组件: components/common/Button.js, components/common/Input.js, components/common/MapDisplay.js
- 导航与布局: components/Layout/Header.js, components/Layout/Footer.js

### 后端模块：
- 用户管理API: routes/userRoutes.js, models/User.js (注册、登录、个人资料、认证)
- 商品管理API: routes/productRoutes.js, models/Product.js (发布、获取、更新、删除商品)
- 聊天/私信API: routes/chatRoutes.js, models/Chat.js, models/Message.js (发送消息、获取聊天记录)
- 评价/信誉API: routes/ratingRoutes.js, models/Rating.js (提交评价、获取评价)
- 举报API: routes/reportRoutes.js, models/Report.js (提交举报)
- 管理后台API: routes/adminRoutes.js (用户管理、商品管理、举报处理)
- 地理位置服务集成: utils/geoService.js

### 数据库模型：
- User: _id, username, passwordHash, email, phone, location (city, district, geo-coordinates), isVerified (for real name), rating (average score), totalRatings, postedProducts (array of product IDs)
- Product: _id, title, description, price, category, images (array of URLs), location (city, district, detailed address), seller (_id of User), status (active, sold, inactive), createdAt
- Chat: _id, participants (array of User _ids), messages (array of Message _ids), lastMessageAt
- Message: _id, chat (_id of Chat), sender (_id of User), content, type (text, image), createdAt
- Rating: _id, rater (_id of User), ratee (_id of User), productId (_id of Product), score, comment, createdAt
- Report: _id, reporter (_id of User), reportedItemType (user/product/chat), reportedItemId, reason, status (pending/resolved/rejected), createdAt
