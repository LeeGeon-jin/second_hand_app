const mongoose = require('mongoose');

// MongoDB Atlas 连接字符串 - 需要从环境变量获取
const MONGODB_URI = process.env.MONGODB_URI;

async function fixAtlasCategories() {
  try {
    if (!MONGODB_URI) {
      console.log('❌ 请设置 MONGODB_URI 环境变量');
      console.log('💡 提示: 请从 .env 文件中复制 MONGODB_URI 的值');
      return;
    }

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
    
    // 将"服装鞋帽"改为"服饰"
    const result2 = await db.collection('products').updateMany(
      { category: '服装鞋帽' },
      { $set: { category: '服饰' } }
    );
    console.log(`✅ 将 ${result2.modifiedCount} 个"服装鞋帽"分类改为"服饰"`);
    
    // 将"家居用品"改为"家具"
    const result3 = await db.collection('products').updateMany(
      { category: '家居用品' },
      { $set: { category: '家具' } }
    );
    console.log(`✅ 将 ${result3.modifiedCount} 个"家居用品"分类改为"家具"`);
    
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
  }
}

fixAtlasCategories();
