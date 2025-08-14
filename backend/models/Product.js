// 商品模型
const mongoose = require('mongoose');

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
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 购买者
  status: { type: String, enum: ['active', 'sold', 'inactive', 'pending_completion'], default: 'active' },
  visibleTo: { type: [String], default: ['all'] }, // ['all']或['user:<id>','admin']
  
  // 交易完成相关字段
  transaction: {
    buyerConfirmed: { type: Boolean, default: false }, // 买家确认交易完成
    sellerConfirmed: { type: Boolean, default: false }, // 卖家确认交易完成
    completedAt: Date, // 交易完成时间
    buyerRating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String,
      ratedAt: Date
    },
    sellerRating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String,
      ratedAt: Date
    }
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
