const mongoose = require('mongoose');

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/second_hand_app';

async function showDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');
    
    const db = mongoose.connection.db;
    
    console.log('\n📊 MongoDB数据库表结构');
    console.log('========================');
    
    const collections = ['users', 'products', 'chats', 'messages', 'ratings', 'reports'];
    
    for (const colName of collections) {
      console.log(`\n🔸 ${colName} 表:`);
      const collection = db.collection(colName);
      const count = await collection.countDocuments();
      console.log(`   文档数量: ${count}`);
      
      if (count > 0) {
        const sample = await collection.findOne();
        console.log(`   示例文档结构:`);
        console.log(JSON.stringify(sample, null, 2));
        
        // 显示前3个文档
        const docs = await collection.find().limit(3).toArray();
        console.log(`\n   前3个文档:`);
        docs.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${JSON.stringify(doc, null, 2)}`);
        });
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

showDatabase();
