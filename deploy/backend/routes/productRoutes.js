// 商品相关API路由
const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// 获取所有商品
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    // 获取用户信息
    const User = require('../models/User');
    const productsWithUser = await Promise.all(
      products.map(async (product) => {
        const user = await User.findById(product.seller).select('username');
        return {
          ...product.toObject(),
          user: {
            id: user?._id,
            name: user?.username || '未知用户',
            avatar: user?.avatar || ''
          }
        };
      })
    );
    
    res.json(productsWithUser);
  } catch (error) {
    console.error('获取商品失败:', error);
    res.status(500).json({ message: '获取商品失败' });
  }
});

// 发布商品（需登录，AI内容审核）
const { moderateText, moderateImages } = require('../utils/aiContentModeration');
const { validateAddress } = require('../utils/aiAddressValidation');
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

// 地址验证API
router.post('/validate-address', async (req, res) => {
  const { suburb, state } = req.body;
  
  if (!suburb || !state) {
    return res.status(400).json({ 
      isValid: false, 
      message: '请提供suburb和state参数' 
    });
  }

  try {
    const result = await validateAddress(suburb, state);
    res.json(result);
  } catch (error) {
    console.error('地址验证错误:', error);
    res.status(500).json({ 
      isValid: false, 
      message: '地址验证服务暂时不可用' 
    });
  }
});

// AI估价API
const { estimatePriceWithHF } = require('../utils/huggingFaceAI');
router.post('/estimate-price', async (req, res) => {
  const { title, category, description, images } = req.body;

  if (!title || !category) {
    return res.status(400).json({
      success: false,
      message: '请提供商品标题和类别'
    });
  }

  try {
    const result = await estimatePriceWithHF(title, category, description, images);
    res.json(result);
  } catch (error) {
    console.error('AI估价错误:', error);
    res.status(500).json({
      success: false,
      message: '估价服务暂时不可用'
    });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: '商品不存在' });
    
    // 获取用户信息
    const User = require('../models/User');
    const user = await User.findById(product.seller).select('username');
    
    const productWithUser = {
      ...product.toObject(),
      user: {
        id: user?._id,
        name: user?.username || '未知用户',
        avatar: user?.avatar || ''
      }
    };
    
    res.json(productWithUser);
  } catch (error) {
    console.error('获取商品失败:', error);
    res.status(500).json({ message: '获取商品失败' });
  }
});

// 更新商品（需登录，且为本人）
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: '商品不存在' });
    if (product.seller.toString() !== req.user.id) return res.status(403).json({ message: '无权更新' });
    
    // 更新允许的字段
    const { title, description, price, category, images, location } = req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (images) product.images = images;
    if (location) product.location = location;
    
    await product.save();
    res.json({ message: '更新成功', product });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({ message: '更新商品失败' });
  }
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
