const express = require('express');
const path = require('path');

const app = express();

// 静态文件服务
app.use(express.static(__dirname));

// 所有路由都返回 index.html (SPA 支持)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Frontend server running on port ' + PORT);
});
