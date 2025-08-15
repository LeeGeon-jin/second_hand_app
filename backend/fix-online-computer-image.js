const https = require('https');

// 修复在线数据库中电脑商品的图片路径
async function fixOnlineComputerImage() {
  try {
    console.log('🔧 修复在线数据库中电脑商品的图片路径...');
    
    // 首先获取所有商品
    const products = await fetchProducts();
    
    // 找到电脑商品
    const computerProduct = products.find(p => p.title && p.title.includes('17寸二手7750笔记本电脑'));
    
    if (computerProduct) {
      console.log('📱 找到电脑商品:', computerProduct.title);
      console.log('当前图片路径:', computerProduct.images ? computerProduct.images[0] : '无图片');
      
      // 使用一个存在的图片文件路径
      const newImagePath = '/api/upload/uploads/image-1754829857085-971762073.jpg';
      
      console.log('新图片路径:', newImagePath);
      console.log('💡 请手动在MongoDB Atlas中更新此商品的图片路径');
      console.log('   商品ID:', computerProduct._id);
      console.log('   新图片路径:', newImagePath);
      
    } else {
      console.log('❌ 未找到电脑商品');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

function fetchProducts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'secondhand-production.up.railway.app',
      port: 443,
      path: '/api/products',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const products = JSON.parse(data);
          resolve(products);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

fixOnlineComputerImage();
