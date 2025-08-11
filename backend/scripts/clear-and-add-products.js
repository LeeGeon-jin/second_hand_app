// 清空数据库并添加新的商品数据
const mongoose = require('mongoose');

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/second_hand_app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 商品模型
const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  location: {
    city: String,
    district: String,
    address: String
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

// 真实的二手商品数据
const realisticProducts = [
  {
    title: 'iPhone 14 Pro Max 256GB',
    description: '去年买的iPhone 14 Pro Max，深空黑色，256GB，电池健康度95%，无划痕，带原装充电器和保护壳',
    price: 1200,
    category: '电子产品',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop'],
    location: {
      city: '北京',
      district: '海淀区',
      address: '中关村'
    },
    status: 'active'
  },
  {
    title: 'MacBook Pro 14寸 M2芯片',
    description: 'MacBook Pro 14寸，M2 Pro芯片，16GB内存，512GB存储，银色，九成新，因换新机出售',
    price: 2800,
    category: '电子产品',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop'],
    location: {
      city: '上海',
      district: '静安区',
      address: '南京西路'
    },
    status: 'active'
  },
  {
    title: 'Nike Air Force 1 白色',
    description: 'Nike Air Force 1 经典白色，42码，穿过几次，鞋底轻微磨损，鞋面干净',
    price: 80,
    category: '服装鞋帽',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop'],
    location: {
      city: '广州',
      district: '越秀区',
      address: '北京路'
    },
    status: 'active'
  },
  {
    title: '索尼WH-1000XM4 降噪耳机',
    description: '索尼WH-1000XM4无线降噪耳机，黑色，音质完美，降噪效果很好，带原装充电盒',
    price: 350,
    category: '电子产品',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop'],
    location: {
      city: '深圳',
      district: '福田区',
      address: '华强北'
    },
    status: 'active'
  },
  {
    title: '宜家PAX衣柜 白色',
    description: '宜家PAX衣柜，白色，200x60x236cm，带镜子，搬家急售，需要自提',
    price: 200,
    category: '家居用品',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop'],
    location: {
      city: '杭州',
      district: '滨江区',
      address: '滨盛路'
    },
    status: 'active'
  },
  {
    title: '小米空气净化器 Pro H',
    description: '小米空气净化器Pro H，除甲醛，除PM2.5，使用一年，滤芯刚换过，效果很好',
    price: 180,
    category: '家居用品',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'],
    location: {
      city: '成都',
      district: '锦江区',
      address: '春熙路'
    },
    status: 'active'
  },
  {
    title: '华为MateBook X Pro',
    description: '华为MateBook X Pro，13.9寸触屏，i7处理器，16GB内存，512GB固态，深空灰',
    price: 1600,
    category: '电子产品',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop'],
    location: {
      city: '武汉',
      district: '江汉区',
      address: '江汉路'
    },
    status: 'active'
  },
  {
    title: 'Adidas Ultraboost 21',
    description: 'Adidas Ultraboost 21跑鞋，黑色，43码，穿过几次，鞋底有轻微磨损，适合日常跑步',
    price: 120,
    category: '服装鞋帽',
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=200&fit=crop'],
    location: {
      city: '西安',
      district: '雁塔区',
      address: '大雁塔'
    },
    status: 'active'
  },
  {
    title: '戴森V11吸尘器',
    description: '戴森V11无线吸尘器，Absolute Extra，带所有配件，电池续航很好，搬家急售',
    price: 450,
    category: '家居用品',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'],
    location: {
      city: '南京',
      district: '鼓楼区',
      address: '新街口'
    },
    status: 'active'
  },
  {
    title: 'Switch OLED版 + 游戏',
    description: 'Nintendo Switch OLED版，白色，带塞尔达传说、马里奥奥德赛、动物之森等游戏卡带',
    price: 380,
    category: '电子产品',
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'],
    location: {
      city: '重庆',
      district: '渝中区',
      address: '解放碑'
    },
    status: 'active'
  }
];

// 清空并添加商品数据
async function clearAndAddData() {
  try {
    console.log('🗑️  清空现有商品数据...');
    await Product.deleteMany({});
    console.log('✅ 数据库已清空');
    
    console.log('📦 添加新的商品数据...');
    const products = await Product.insertMany(realisticProducts);
    console.log(`✅ 成功添加 ${products.length} 个商品`);
    
    // 显示添加的商品
    products.forEach(product => {
      console.log(`- ${product.title}: ¥${product.price} (${product.category})`);
    });
    
    console.log('🎉 商品数据更新完成！');
    console.log('总商品数量:', await Product.countDocuments());
    process.exit(0);
  } catch (error) {
    console.error('❌ 操作失败:', error);
    process.exit(1);
  }
}

clearAndAddData();
