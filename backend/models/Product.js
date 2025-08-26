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
  status: { type: String, enum: ['active', 'sold', 'inactive'], default: 'active' },
  visibleTo: { type: [String], default: ['all'] }, // ['all']或['user:<id>','admin']
  collectCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
