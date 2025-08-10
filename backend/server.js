// Express 服务器入口
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// 路由挂载
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// 数据库连接（使用环境变量）
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secondhand';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
