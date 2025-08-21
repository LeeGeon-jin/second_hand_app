const axios = require('axios');

// 本地估价逻辑（备用方案）- 优化后的价格基础
function getLocalEstimate(title, category) {
  // 基础价格表（基于真实澳洲二手市场价格调研）- 二手价格调整
  // 二手产品价格特点：电子产品3-6折，家具3-5折，运动用品4-7折，服饰2-5折
  const basePrices = {
    '家具': 100,      // 二手家具基础价格（IKEA书桌原价$150-200，二手$60-100）
    '电器': 150,      // 二手电器基础价格
    '电子产品': 1000, // 二手电子产品基础价格（iPhone原价$1800-2200，二手$800-1200）
    '文具': 30,       // 二手文具基础价格
    '服饰': 50,       // 二手服饰基础价格（原价$100-200，二手$20-100）
    '运动': 120,      // 二手运动用品基础价格（原价$200-300，二手$80-200）
    '母婴': 80,       // 二手母婴用品基础价格
    '美妆': 40,       // 二手美妆基础价格
    '乐器': 300,      // 二手乐器基础价格
    '图书': 20,       // 二手图书基础价格
    '宠物': 80,       // 二手宠物用品基础价格
    '其他': 60        // 二手其他物品基础价格
  };

  // 全局乘数覆盖：统一为0.9
  const OVERRIDE_MULTIPLIER = 0.9;

  // 根据标题关键词调整价格
  let price = basePrices[category] || 50;

  // 品牌识别和价格调整 - 基于真实二手市场价格调整
  const brandKeywords = {
    // 电子产品 - 基于3-6折的二手价格
    'iPhone': { multiplier: 2.0, category: '电子产品' },  // iPhone二手约4-5折
    'Samsung': { multiplier: 1.3, category: '电子产品' },  // Samsung二手约4-5折
    'MacBook': { multiplier: 2.0, category: '电子产品' },  // MacBook二手约4-5折
    'iPad': { multiplier: 1.2, category: '电子产品' },     // iPad二手约4-5折
    'AirPods': { multiplier: 1.0, category: '电子产品' },  // AirPods二手约4-5折
    'Sony': { multiplier: 1.5, category: '电子产品' },     // Sony二手约4-5折
    'Canon': { multiplier: 1.8, category: '电子产品' },    // Canon二手约4-5折
    'Nikon': { multiplier: 1.8, category: '电子产品' },    // Nikon二手约4-5折
    // 运动用品 - 基于4-7折的二手价格
    'Nike': { multiplier: 1.4, category: '运动' },         // Nike二手约5-6折
    'Adidas': { multiplier: 1.2, category: '运动' },       // Adidas二手约5-6折
    'Jordan': { multiplier: 1.4, category: '运动' },       // Jordan二手约5-6折
    'Air Jordan': { multiplier: 1.4, category: '运动' },   // Air Jordan二手约5-6折
    // 家具 - 基于3-5折的二手价格
    'IKEA': { multiplier: 0.8, category: '家具' },         // IKEA二手约3-4折
    'BILLY': { multiplier: 0.9, category: '家具' },        // IKEA BILLY二手约3-4折
    'MALM': { multiplier: 0.9, category: '家具' },         // IKEA MALM二手约3-4折
    'POANG': { multiplier: 0.85, category: '家具' },       // IKEA POANG二手约3-4折
    // 服饰 - 基于2-5折的二手价格
    'UNIQLO': { multiplier: 0.8, category: '服饰' },       // UNIQLO二手约2-3折
    '优衣库': { multiplier: 0.8, category: '服饰' },       // 优衣库二手约2-3折
    'ZARA': { multiplier: 0.9, category: '服饰' },         // ZARA二手约3-4折
    'H&M': { multiplier: 0.8, category: '服饰' },          // H&M二手约2-3折
    'Levi': { multiplier: 0.9, category: '服饰' }          // Levi's二手约3-4折
  };

  // 检查标题中的品牌关键词
  for (const [brand, config] of Object.entries(brandKeywords)) {
    if (title.toLowerCase().includes(brand.toLowerCase()) && category === config.category) {
      price = Math.round(price * OVERRIDE_MULTIPLIER);
      break;
    }
  }

  // 成色关键词调整
  const conditionKeywords = {
    '全新': 1.05,
    '九成新': 1.0,
    '八成新': 0.8,
    '七成新': 0.6,
    '六成新': 0.5,
    '五成新': 0.4,
    '四成新': 0.3,
    '三成新': 0.2
  };

  for (const [condition, multiplier] of Object.entries(conditionKeywords)) {
    if (title.includes(condition)) {
      price = Math.round(price * OVERRIDE_MULTIPLIER);
      break;
    }
  }

  // 特殊商品类型调整
  if (category === '其他') {
    if (title.includes('画') || title.includes('艺术品')) {
      price = 100; // 艺术品基础价格
    } else if (title.includes('收藏') || title.includes('限量')) {
      price = 150; // 收藏品基础价格
    }
  }

  // 智能手机价格上限（防止过高）：全新<=1400，非全新<=1200
  const smartphoneKeywords = ['iPhone', 'Samsung', 'Galaxy', 'Pixel', '小米', '华为', 'OPPO', 'vivo', '手机'];
  const containsSmartphoneKeyword = smartphoneKeywords.some(k => title.toLowerCase().includes(k.toLowerCase()));
  if (category === '电子产品' && containsSmartphoneKeyword) {
    const isBrandNew = title.includes('全新');
    const cap = isBrandNew ? 1400 : 1200;
    price = Math.min(price, cap);
  }

  return Math.max(10, price); // 最低10澳元
}

function getLocalPriceRange(category, estimatedPrice) {
  // 价格范围计算（±30%）
  const min = Math.max(10, Math.round(estimatedPrice * 0.7));
  const max = Math.round(estimatedPrice * 1.3);

  // 类别特定范围限制（澳元价格）- 微调
  const categoryRanges = {
    '家具': { min: 30, max: 800 },
    '电器': { min: 50, max: 1200 },
    '电子产品': { min: 100, max: 3000 },
    '文具': { min: 10, max: 200 },
    '服饰': { min: 15, max: 200 },
    '服装鞋帽': { min: 15, max: 200 },
    '运动': { min: 20, max: 600 },
    '母婴': { min: 15, max: 400 },
    '美妆': { min: 5, max: 150 },
    '乐器': { min: 50, max: 1500 },
    '图书': { min: 3, max: 80 },
    '宠物': { min: 10, max: 300 },
    '家居用品': { min: 30, max: 800 },
    '其他': { min: 10, max: 500 }
  };

  const range = categoryRanges[category] || { min: 10, max: 1000 };
  return {
    min: Math.max(range.min, min),
    max: Math.min(range.max, max)
  };
}

// AI估价函数（使用本地算法）
async function estimatePriceWithHF(title, category, description, images) {
  try {
    // 检查必要参数
    if (!title || !category) {
      return {
        success: false,
        message: '请提供商品标题和类别'
      };
    }

    // 检查描述长度
    if (!description || description.length < 20) {
      return {
        success: false,
        message: '描述不能少于20个字'
      };
    }

    // 检查图片
    if (!images || images.length === 0) {
      return {
        success: false,
        message: '请上传至少一张商品图片'
      };
    }

    console.log('🔄 使用本地智能算法...');
    
    // 使用本地智能估价算法
    const estimatedPrice = getLocalEstimate(title, category);
    const priceRange = getLocalPriceRange(category, estimatedPrice);
    
    // 智能分析商品特征
    let reasoning = `基于${category}类别的市场行情`;
    let suggestions = [
      '建议在类似商品中比较价格',
      '考虑商品成色对价格的影响',
      '关注市场供需情况'
    ];

    // 品牌识别
    const brandKeywords = ['iPhone', 'Samsung', 'MacBook', 'iPad', 'Nike', 'Adidas'];
    for (const brand of brandKeywords) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        reasoning += `，识别到品牌${brand}`;
        suggestions.push(`品牌${brand}通常有较高的保值率`);
        break;
      }
    }

    // 成色识别
    const conditionKeywords = ['全新', '九成新', '八成新', '七成新'];
    for (const condition of conditionKeywords) {
      if (title.includes(condition)) {
        reasoning += `，商品成色${condition}`;
        suggestions.push(`成色${condition}的商品价格相对稳定`);
        break;
      }
    }

    // 特殊商品分析
    if (category === '其他') {
      if (title.includes('画') || title.includes('艺术品')) {
        reasoning += '，艺术品具有收藏价值';
        suggestions.push('艺术品价格波动较大，建议参考专业评估');
      } else if (title.includes('收藏') || title.includes('限量')) {
        reasoning += '，限量版商品具有稀缺性';
        suggestions.push('限量版商品可能高于市场预期');
      }
    }

    // 根据描述长度调整建议
    if (description.length > 50) {
      suggestions.push('详细描述有助于买家了解商品，建议保持');
    }

    return {
      success: true,
      estimatedPrice: estimatedPrice,
      priceRange: priceRange,
      suggestions: suggestions,
      reasoning: reasoning,
      source: '本地智能算法'
    };
  } catch (error) {
    console.error('本地估价错误:', error);
    return {
      success: false,
      message: '估价服务暂时不可用'
    };
  }
}

module.exports = {
  estimatePriceWithHF,
  getLocalEstimate,
  getLocalPriceRange
};
