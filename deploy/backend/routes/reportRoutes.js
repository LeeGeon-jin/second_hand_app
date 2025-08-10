// 举报相关API路由
const express = require('express');
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const router = express.Router();

// 提交举报
router.post('/', auth, async (req, res) => {
  const { reportedItemType, reportedItemId, reason } = req.body;
  const report = new Report({
    reporter: req.user.id,
    reportedItemType,
    reportedItemId,
    reason,
    status: 'pending'
  });
  await report.save();
  res.json({ message: '举报已提交', report });
});

module.exports = router;
