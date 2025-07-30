// 商品相关API路由
const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// 获取所有商品
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// 发布商品（需登录，AI内容审核）
const { moderateText, moderateImages } = require('../utils/aiContentModeration');
router.post('/', auth, async (req, res) => {
  const { title, description, price, category, images, location } = req.body;
  // AI文本审核
  const textResult = await moderateText(`${title} ${description}`);
  // AI图片审核
  const imgResult = await moderateImages(images);
  let visibleTo = ['all'];
  let auditMsg = '';
  if (!textResult.ok || !imgResult.ok) {
    // 审核不通过，仅本人和管理员可见
    visibleTo = [`user:${req.user.id}`, 'admin'];
    auditMsg = `内容未通过AI审核：${textResult.reason || ''} ${imgResult.reason || ''}`;
  }
  const product = new Product({
    title, description, price, category, images, location,
    seller: req.user.id,
    visibleTo
  });
  await product.save();
  // 添加到用户的postedProducts
  const User = require('../models/User');
  await User.findByIdAndUpdate(req.user.id, { $push: { postedProducts: product._id } });
  if (auditMsg) {
    return res.status(200).json({ message: auditMsg, product, auditFailed: true });
  }
  res.json({ message: '商品发布成功', product });
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: '商品不存在' });
  res.json(product);
});

// 删除商品（需登录，且为本人）
router.delete('/:id', auth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: '商品不存在' });
  if (product.seller.toString() !== req.user.id) return res.status(403).json({ message: '无权删除' });
  await product.deleteOne();
  res.json({ message: '删除成功' });
});

module.exports = router;
