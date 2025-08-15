const https = require('https');

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

async function checkProducts() {
  try {
    console.log('🔍 检查在线API商品数据...');
    const products = await fetchProducts();
    
    console.log(`\n📊 总商品数: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ 没有商品数据');
      return;
    }
    
    console.log('\n📋 商品详情:');
    products.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title || '无标题'}`);
      console.log(`   状态: ${item.status || '未知'}`);
      console.log(`   分类: ${item.category || '未分类'}`);
      console.log(`   价格: $${item.price || 0}`);
      console.log(`   创建时间: ${item.createdAt || '未知'}`);
      
      // 检查图片信息
      if (item.images && item.images.length > 0) {
        console.log(`   图片: ${item.images[0]}`);
      } else if (item.image) {
        console.log(`   图片: ${item.image}`);
      } else {
        console.log(`   图片: 无图片`);
      }
      console.log('');
    });
    
    // 检查分类统计
    const categories = {};
    products.forEach(item => {
      const category = item.category || '未分类';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    console.log('📈 分类统计:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}个商品`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkProducts();
