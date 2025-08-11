// JWT 鉴权中间件
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未登录或token缺失' });
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: '服务器配置错误' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'token无效' });
  }
};

module.exports = auth;
