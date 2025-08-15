const mongoose = require('mongoose');

// 这里需要填入你的MongoDB Atlas连接字符串
// 请从MongoDB Atlas网页界面复制连接字符串
const MONGODB_URI = 'mongodb+srv://qianchen:qianchen123@cluster0.mongodb.net/test?retryWrites=true&w=majority';

async function fixAtlasCategories() {
  try {
    console.log('🔗 连接到 MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');
    
    const db = mongoose.connection.db;
    
    console.log('\n🔍 检查当前分类情况...');
    const products = await db.collection('products').find({}).toArray();
    
    const categories = {};
    products.forEach(product => {
      const category = product.category || '未分类';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    console.log('当前分类统计:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}个商品`);
    });
    
    // 修复分类名称
    console.log('\n🔧 修复分类名称...');
    
    // 将"电子"改为"电子产品"
    const result1 = await db.collection('products').updateMany(
      { category: '电子' },
      { $set: { category: '电子产品' } }
    );
    console.log(`✅ 将 ${result1.modifiedCount} 个"电子"分类改为"电子产品"`);
    
    // 检查修复后的情况
    console.log('\n🔍 修复后的分类情况...');
    const updatedProducts = await db.collection('products').find({}).toArray();
    
    const updatedCategories = {};
    updatedProducts.forEach(product => {
      const category = product.category || '未分类';
      updatedCategories[category] = (updatedCategories[category] || 0) + 1;
    });
    
    console.log('修复后分类统计:');
    Object.entries(updatedCategories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}个商品`);
    });
    
    // 检查电子产品
    const electronicProducts = updatedProducts.filter(p => p.category === '电子产品');
    console.log(`\n🔸 电子产品分类商品数量: ${electronicProducts.length}`);
    electronicProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.title} (状态: ${product.status})`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 错误:', error);
    console.log('💡 提示: 请检查MongoDB Atlas连接字符串是否正确');
  }
}

fixAtlasCategories();
