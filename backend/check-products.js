const mongoose = require('mongoose');

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/second_hand_app';

async function checkProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');
    
    const db = mongoose.connection.db;
    
    // 获取所有商品
    const products = await db.collection('products').find({}).toArray();
    console.log(`\n📊 总商品数量: ${products.length}`);
    
    // 分析分类
    console.log('\n🔸 商品分类统计:');
    const categories = {};
    products.forEach(product => {
      const category = product.category || '未分类';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}个商品`);
    });
    
    // 检查电子产品分类
    console.log('\n🔸 电子产品分类商品:');
    const electronicProducts = products.filter(p => p.category === '电子产品');
    console.log(`   电子产品分类商品数量: ${electronicProducts.length}`);
    
    electronicProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title} (状态: ${product.status})`);
    });
    
    // 检查API调用
    console.log('\n🔸 测试API调用:');
    try {
      const response = await fetch('https://secondhand-production.up.railway.app/api/products');
      const data = await response.json();
      console.log(`   在线API返回商品数量: ${data.length}`);
      
      const electronicFromAPI = data.filter(p => p.category === '电子产品');
      console.log(`   在线API电子产品数量: ${electronicFromAPI.length}`);
      
    } catch (error) {
      console.log(`   在线API调用失败: ${error.message}`);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

checkProducts();
