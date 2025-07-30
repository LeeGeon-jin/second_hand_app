// 评价相关API路由
const express = require('express');
const Rating = require('../models/Rating');
const auth = require('../middleware/auth');
const router = express.Router();

// 提交评价
router.post('/', auth, async (req, res) => {
  const { ratee, productId, score, comment } = req.body;
  const rating = new Rating({
    rater: req.user.id,
    ratee,
    productId,
    score,
    comment
  });
  await rating.save();
  res.json({ message: '评价成功', rating });
});

// 获取某用户评价
router.get('/user/:userId', async (req, res) => {
  const ratings = await Rating.find({ ratee: req.params.userId });
  res.json(ratings);
});

module.exports = router;
