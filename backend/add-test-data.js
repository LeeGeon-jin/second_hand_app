// 添加测试商品数据
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

// 测试商品数据
const testProducts = [
  {
    title: 'iPhone 13 Pro',
    description: '九成新iPhone 13 Pro，256GB，深空灰色，无划痕',
    price: 4500,
    category: '电子产品',
    images: ['https://via.placeholder.com/300x200?text=iPhone+13+Pro'],
    location: {
      city: '北京',
      district: '朝阳区',
      address: '三里屯'
    },
    status: 'active'
  },
  {
    title: 'MacBook Air M1',
    description: 'MacBook Air M1芯片，8GB内存，256GB存储，银色',
    price: 6800,
    category: '电子产品',
    images: ['https://via.placeholder.com/300x200?text=MacBook+Air'],
    location: {
      city: '上海',
      district: '浦东新区',
      address: '陆家嘴'
    },
    status: 'active'
  },
  {
    title: 'Nike Air Jordan 1',
    description: 'Nike Air Jordan 1 Retro High OG，芝加哥配色，42码',
    price: 1200,
    category: '服装鞋帽',
    images: ['https://via.placeholder.com/300x200?text=Air+Jordan+1'],
    location: {
      city: '广州',
      district: '天河区',
      address: '体育西路'
    },
    status: 'active'
  },
  {
    title: '索尼PS5',
    description: '索尼PlayStation 5，光驱版，带两个手柄',
    price: 3200,
    category: '电子产品',
    images: ['https://via.placeholder.com/300x200?text=PS5'],
    location: {
      city: '深圳',
      district: '南山区',
      address: '科技园'
    },
    status: 'active'
  },
  {
    title: '宜家书桌',
    description: '宜家MALM书桌，白色，120x60cm，九成新',
    price: 200,
    category: '家居用品',
    images: ['https://via.placeholder.com/300x200?text=书桌'],
    location: {
      city: '杭州',
      district: '西湖区',
      address: '文三路'
    },
    status: 'active'
  }
];

// 添加测试数据
async function addTestData() {
  try {
    // 清空现有数据
    await Product.deleteMany({});
    console.log('已清空现有商品数据');
    
    // 添加测试数据
    const products = await Product.insertMany(testProducts);
    console.log(`成功添加 ${products.length} 个测试商品`);
    
    // 显示添加的商品
    products.forEach(product => {
      console.log(`- ${product.title}: ¥${product.price}`);
    });
    
    console.log('测试数据添加完成！');
    process.exit(0);
  } catch (error) {
    console.error('添加测试数据失败:', error);
    process.exit(1);
  }
}

addTestData();
