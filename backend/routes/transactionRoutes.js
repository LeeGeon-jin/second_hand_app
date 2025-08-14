// 交易管理路由
const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// 开始交易 - 买家点击购买
router.post('/start/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.status !== 'active') {
      return res.status(400).json({ message: '商品不可购买' });
    }
    
    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ message: '不能购买自己的商品' });
    }
    
    // 更新商品状态
    product.buyer = req.user.id;
    product.status = 'pending_completion';
    product.transaction = {
      buyerConfirmed: false,
      sellerConfirmed: false,
      buyerRating: {},
      sellerRating: {}
    };
    
    await product.save();
    
    res.json({ 
      message: '交易已开始，请与卖家协商交易详情',
      product 
    });
  } catch (error) {
    console.error('开始交易失败:', error);
    res.status(500).json({ message: '开始交易失败' });
  }
});

// 确认交易完成
router.post('/confirm/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('seller', 'username')
      .populate('buyer', 'username');
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.status !== 'pending_completion') {
      return res.status(400).json({ message: '商品状态不正确' });
    }
    
    const isBuyer = product.buyer && product.buyer._id.toString() === req.user.id;
    const isSeller = product.seller._id.toString() === req.user.id;
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: '无权确认此交易' });
    }
    
    // 更新确认状态
    if (isBuyer) {
      product.transaction.buyerConfirmed = true;
    } else if (isSeller) {
      product.transaction.sellerConfirmed = true;
    }
    
    // 如果双方都确认，则完成交易
    if (product.transaction.buyerConfirmed && product.transaction.sellerConfirmed) {
      product.status = 'sold';
      product.transaction.completedAt = new Date();
    }
    
    await product.save();
    
    const message = product.status === 'sold' 
      ? '交易已完成！现在可以互相评分了' 
      : '已确认交易完成，等待对方确认';
    
    res.json({ 
      message,
      product,
      canRate: product.status === 'sold'
    });
  } catch (error) {
    console.error('确认交易失败:', error);
    res.status(500).json({ message: '确认交易失败' });
  }
});

// 取消交易
router.post('/cancel/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.status !== 'pending_completion') {
      return res.status(400).json({ message: '无法取消此交易' });
    }
    
    const isBuyer = product.buyer && product.buyer.toString() === req.user.id;
    const isSeller = product.seller.toString() === req.user.id;
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: '无权取消此交易' });
    }
    
    // 重置商品状态
    product.status = 'active';
    product.buyer = null;
    product.transaction = {
      buyerConfirmed: false,
      sellerConfirmed: false,
      buyerRating: {},
      sellerRating: {}
    };
    
    await product.save();
    
    res.json({ message: '交易已取消', product });
  } catch (error) {
    console.error('取消交易失败:', error);
    res.status(500).json({ message: '取消交易失败' });
  }
});

// 评分
router.post('/rate/:productId', auth, async (req, res) => {
  try {
    const { score, comment } = req.body;
    const product = await Product.findById(req.params.productId)
      .populate('seller', 'username')
      .populate('buyer', 'username');
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    if (product.status !== 'sold') {
      return res.status(400).json({ message: '只有已完成的交易可以评分' });
    }
    
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: '评分必须在1-5之间' });
    }
    
    const isBuyer = product.buyer && product.buyer._id.toString() === req.user.id;
    const isSeller = product.seller._id.toString() === req.user.id;
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: '无权评分此商品' });
    }
    
    // 保存评分
    if (isBuyer) {
      if (product.transaction.buyerRating.score) {
        return res.status(400).json({ message: '您已经评分过了' });
      }
      product.transaction.buyerRating = {
        score,
        comment: comment || '',
        ratedAt: new Date()
      };
    } else if (isSeller) {
      if (product.transaction.sellerRating.score) {
        return res.status(400).json({ message: '您已经评分过了' });
      }
      product.transaction.sellerRating = {
        score,
        comment: comment || '',
        ratedAt: new Date()
      };
    }
    
    await product.save();
    
    res.json({ 
      message: '评分成功！', 
      product 
    });
  } catch (error) {
    console.error('评分失败:', error);
    res.status(500).json({ message: '评分失败' });
  }
});

// 获取我的交易记录
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    
    let query = {
      $or: [
        { seller: req.user.id },
        { buyer: req.user.id }
      ]
    };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    const products = await Product.find(query)
      .populate('seller', 'username')
      .populate('buyer', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({ message: '获取交易记录失败' });
  }
});

module.exports = router;
