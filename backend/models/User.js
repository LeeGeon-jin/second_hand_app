// 用户模型
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  email: String,
  phone: String,
  avatar: String,
  location: {
    city: String,
    district: String,
    geo: { type: [Number], index: '2dsphere' }
  },
  isVerified: Boolean,
  rating: Number,
  totalRatings: Number,
  postedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  collectedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

module.exports = mongoose.model('User', UserSchema);
