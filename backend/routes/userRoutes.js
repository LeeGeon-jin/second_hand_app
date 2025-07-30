// 用户相关API路由
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  const { username, password, email, phone } = req.body;
  if (!username || !password) return res.status(400).json({ message: '用户名和密码必填' });
  const exist = await User.findOne({ username });
  if (exist) return res.status(400).json({ message: '用户名已存在' });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, passwordHash: hash, email, phone });
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
  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, username: user.username } });
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json(user);
});

module.exports = router;
