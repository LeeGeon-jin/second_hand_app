const mongoose = require('mongoose');

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/second_hand_app';

async function fixComputerImage() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');
    
    const db = mongoose.connection.db;
    
    // 查找电脑商品
    const product = await db.collection('products').findOne({
      title: { $regex: '17寸二手7750笔记本电脑' }
    });
    
    if (product) {
      console.log('\n📱 找到电脑商品，正在修复图片路径...');
      
      // 使用一个存在的图片文件
      const newImagePath = '/api/upload/uploads/image-1754829857085-971762073.jpg';
      
      // 更新图片路径
      const result = await db.collection('products').updateOne(
        { _id: product._id },
        { 
          $set: { 
            images: [newImagePath],
            image: newImagePath
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log('✅ 图片路径修复成功');
        console.log('新图片路径:', newImagePath);
      } else {
        console.log('❌ 图片路径修复失败');
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

fixComputerImage();
