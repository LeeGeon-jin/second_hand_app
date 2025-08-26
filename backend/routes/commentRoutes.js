const express = require('express');
const Comment = require('../models/Comment');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// 获取产品的所有评论
router.get('/products/:productId/comments', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // 验证产品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }

    // 获取评论并按时间倒序排列
    const comments = await Comment.find({ product: productId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ message: '获取评论失败' });
  }
});

// 发表评论（需要登录）
router.post('/products/:productId/comments', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { content } = req.body;

    // 验证输入
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: '评论内容不能超过500字' });
    }

    // 验证产品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }

    // 创建评论
    const comment = new Comment({
      content: content.trim(),
      product: productId,
      user: req.user.id
    });

    await comment.save();

    // 返回包含用户信息的完整评论
    const populatedComment = await comment.populate('user', 'username avatar');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({ message: '发表评论失败' });
  }
});

// 删除评论（需要登录，且为评论作者）
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 检查权限
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权删除此评论' });
    }

    await comment.deleteOne();
    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({ message: '删除评论失败' });
  }
});

// 获取用户的所有评论
router.get('/users/:userId/comments', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({ user: userId })
      .populate('product', 'title images')
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ user: userId });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('获取用户评论失败:', error);
    res.status(500).json({ message: '获取用户评论失败' });
  }
});

module.exports = router;
