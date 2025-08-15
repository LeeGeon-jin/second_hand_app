const mongoose = require('mongoose');

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/second_hand_app';

async function checkComputerProduct() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');
    
    const db = mongoose.connection.db;
    
    // 查找电脑商品
    const product = await db.collection('products').findOne({
      title: { $regex: '17寸二手7750笔记本电脑' }
    });
    
    if (product) {
      console.log('\n📱 电脑商品信息:');
      console.log('标题:', product.title);
      console.log('价格:', product.price);
      console.log('分类:', product.category);
      console.log('状态:', product.status);
      console.log('图片数组:', product.images);
      console.log('单张图片:', product.image);
      
      // 检查图片文件是否存在
      if (product.images && product.images.length > 0) {
        const imagePath = product.images[0];
        console.log('\n🔍 检查图片路径:', imagePath);
        
        // 提取文件名
        const fileName = imagePath.split('/').pop();
        console.log('文件名:', fileName);
        
        // 检查本地文件是否存在
        const fs = require('fs');
        const localPath = `./uploads/${fileName}`;
        if (fs.existsSync(localPath)) {
          console.log('✅ 本地文件存在');
        } else {
          console.log('❌ 本地文件不存在');
        }
      }
    } else {
      console.log('❌ 未找到电脑商品');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

checkComputerProduct();
