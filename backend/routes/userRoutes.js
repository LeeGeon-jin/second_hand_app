
// 用户相关API路由
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// 用户名唯一性校验
router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.json({ exists: false });
  const exist = await User.findOne({ username });
  res.json({ exists: !!exist });
});

// 注册
router.post('/register', async (req, res) => {
  const { username, password, email, phone, location } = req.body;
  if (!username || !password) return res.status(400).json({ message: '用户名和密码必填' });
  const exist = await User.findOne({ username });
  if (exist) return res.status(400).json({ message: '用户名已存在' });
  const hash = await bcrypt.hash(password, 10);
  
  const userData = { username, passwordHash: hash, email, phone };
  if (location) {
    userData.location = location;
  }
  
  const user = new User(userData);
  await user.save();
  res.json({ message: '注册成功' });
});

// 登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: '用户不存在' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ message: '密码错误' });
          if (!process.env.JWT_SECRET) {
          return res.status(500).json({ message: '服务器配置错误' });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, username: user.username } });
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    
    // 获取用户发布的商品
    const Product = require('../models/Product');
    const postedProducts = await Product.find({ seller: req.user.id })
      .populate('buyer', 'username email')
      .sort({ createdAt: -1 });
    
    const userWithProducts = {
      ...user.toObject(),
      postedProducts
    };
    
    res.json(userWithProducts);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

  // 更新用户信息
  router.put('/me', auth, async (req, res) => {
    try {
      const { location } = req.body;
      const updateData = {};
      
      if (location) {
        updateData.location = location;
      }
      
      const user = await User.findByIdAndUpdate(
        req.user.id, 
        updateData,
        { new: true }
      ).select('-passwordHash');
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: '更新失败' });
    }
  });

module.exports = router;
