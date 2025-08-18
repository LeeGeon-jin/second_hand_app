const axios = require('axios');
const { getComparablePrices } = require('./marketData');
const { estimatePriceWithAIServices } = require('./aiServiceManager');

// Hugging Face Inference API配置
const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_MODEL = 'facebook/bart-large-mnli'; // 使用文本分类模型

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

  // 子类与材质识别：所有分类的详细规则
  if (category === '电子产品') {
    const electronicsRules = [
      { keywords: ['iPhone', '苹果手机'], multiplier: 2.5 },
      { keywords: ['Samsung', 'Galaxy', '三星'], multiplier: 2.0 },
      { keywords: ['MacBook', '苹果笔记本'], multiplier: 2.5 },
      { keywords: ['iPad', '苹果平板'], multiplier: 1.5 },
      { keywords: ['AirPods', '苹果耳机'], multiplier: 1.2 },
      { keywords: ['Sony', '索尼'], multiplier: 2.0 },
      { keywords: ['Canon', '佳能'], multiplier: 2.5 },
      { keywords: ['Nikon', '尼康'], multiplier: 2.5 },
      { keywords: ['相机', 'camera'], multiplier: 2.0 },
      { keywords: ['镜头', 'lens'], multiplier: 1.8 },
      { keywords: ['游戏机', 'PS5', 'Xbox', 'Switch'], multiplier: 1.5 },
      { keywords: ['显示器', 'monitor'], multiplier: 1.5 },
      { keywords: ['键盘', 'keyboard'], multiplier: 1.2 },
      { keywords: ['鼠标', 'mouse'], multiplier: 1.1 }
    ];
    for (const rule of electronicsRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 电子产品价格上限（AUD）
    price = Math.min(price, 3000);
  }

  if (category === '家具') {
    const furnitureRules = [
      { keywords: ['沙发', 'sofa'], multiplier: 2.0 },
      { keywords: ['餐桌', 'dining table'], multiplier: 1.8 },
      { keywords: ['书桌', 'desk', '办公桌'], multiplier: 1.4 },
      { keywords: ['书柜', '书架', 'bookcase', 'bookshelf', 'BILLY'], multiplier: 1.2 },
      { keywords: ['衣柜', 'wardrobe'], multiplier: 1.5 },
      { keywords: ['床架', 'bed frame'], multiplier: 1.5 },
      { keywords: ['床垫', 'mattress'], multiplier: 1.8 },
      { keywords: ['茶几', 'coffee table'], multiplier: 1.3 },
      { keywords: ['电视柜', 'tv stand'], multiplier: 1.3 },
      { keywords: ['椅', 'chair', 'POANG'], multiplier: 1.2 },
      { keywords: ['柜子', 'cabinet'], multiplier: 1.4 },
      { keywords: ['架子', 'shelf', 'KALLAX'], multiplier: 1.1 }
    ];
    for (const rule of furnitureRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 家具价格上限（AUD）
    price = Math.min(price, 800);
  }

  if (category === '运动') {
    const sportsRules = [
      { keywords: ['Jordan', 'Air Jordan'], multiplier: 1.8 },
      { keywords: ['Nike', '耐克'], multiplier: 1.8 },
      { keywords: ['Adidas', '阿迪达斯'], multiplier: 1.5 },
      { keywords: ['自行车', 'bicycle', 'bike'], multiplier: 2.0 },
      { keywords: ['跑步机', 'treadmill'], multiplier: 2.5 },
      { keywords: ['哑铃', 'dumbbell'], multiplier: 1.3 },
      { keywords: ['瑜伽垫', 'yoga mat'], multiplier: 1.1 },
      { keywords: ['网球拍', 'tennis racket'], multiplier: 1.5 },
      { keywords: ['高尔夫', 'golf'], multiplier: 1.8 },
      { keywords: ['滑板', 'skateboard'], multiplier: 1.4 },
      { keywords: ['冲浪板', 'surfboard'], multiplier: 2.0 },
      { keywords: ['健身器材', 'gym equipment'], multiplier: 1.5 }
    ];
    for (const rule of sportsRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 运动用品价格上限（AUD）
    price = Math.min(price, 600);
  }

  if (category === '服饰') {
    const apparelRules = [
      { keywords: ['外套', 'jacket', 'coat'], multiplier: 1.5 },
      { keywords: ['羽绒', 'down'], multiplier: 1.8 },
      { keywords: ['皮衣', '皮革', 'leather'], multiplier: 1.6 },
      { keywords: ['羊毛', 'wool'], multiplier: 1.3 },
      { keywords: ['连衣裙', 'dress'], multiplier: 1.3 },
      { keywords: ['西装', 'suit'], multiplier: 1.6 },
      { keywords: ['牛仔裤', 'jeans', 'Levi'], multiplier: 1.2 },
      { keywords: ['运动鞋', 'sneakers', '跑鞋', 'Jordan', 'Nike', 'Adidas'], multiplier: 1.5 },
      { keywords: ['包', 'bag', 'handbag'], multiplier: 1.4 },
      { keywords: ['手表', 'watch'], multiplier: 2.0 },
      { keywords: ['首饰', 'jewelry'], multiplier: 1.8 }
    ];
    for (const rule of apparelRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 奢侈品牌处理
    const luxuryBrands = ['LV', 'Gucci', 'Chanel', 'Prada', 'Hermes', 'Dior'];
    const hasLuxury = luxuryBrands.some(b => title.toLowerCase().includes(b.toLowerCase()));
    const hasProof = ['正品', 'receipt', '小票', '发票'].some(k => title.toLowerCase().includes(k.toLowerCase()));
    if (hasLuxury) {
      price = Math.round(price * OVERRIDE_MULTIPLIER);
    }
    // 服饰价格上限（AUD）
    const apparelCap = hasLuxury && hasProof ? 800 : 200;
    price = Math.min(price, apparelCap);
  }

  if (category === '电器') {
    const applianceRules = [
      { keywords: ['冰箱', 'refrigerator'], multiplier: 2.5 },
      { keywords: ['洗衣机', 'washing machine'], multiplier: 2.0 },
      { keywords: ['微波炉', 'microwave'], multiplier: 1.5 },
      { keywords: ['烤箱', 'oven'], multiplier: 2.0 },
      { keywords: ['咖啡机', 'coffee machine'], multiplier: 2.5 },
      { keywords: ['吸尘器', 'vacuum cleaner'], multiplier: 1.8 },
      { keywords: ['空调', 'air conditioner'], multiplier: 3.0 },
      { keywords: ['电风扇', 'fan'], multiplier: 1.2 },
      { keywords: ['电暖器', 'heater'], multiplier: 1.5 },
      { keywords: ['电视', 'TV', 'television'], multiplier: 2.5 },
      { keywords: ['音响', 'speaker'], multiplier: 2.0 }
    ];
    for (const rule of applianceRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 电器价格上限（AUD）
    price = Math.min(price, 1200);
  }

  if (category === '文具') {
    const stationeryRules = [
      { keywords: ['打印机', 'printer'], multiplier: 2.0 },
      { keywords: ['扫描仪', 'scanner'], multiplier: 1.6 },
      { keywords: ['显示器', 'monitor'], multiplier: 2.5 },
      { keywords: ['投影仪', 'projector'], multiplier: 2.8 },
      { keywords: ['办公椅', 'office chair'], multiplier: 1.8 },
      { keywords: ['台灯', 'desk lamp'], multiplier: 1.2 },
      { keywords: ['背包', '书包', 'backpack'], multiplier: 1.1 },
      { keywords: ['键盘', 'keyboard'], multiplier: 1.2 },
      { keywords: ['鼠标', 'mouse'], multiplier: 1.1 },
      { keywords: ['计算器', 'calculator'], multiplier: 1.1 },
      { keywords: ['白板', 'whiteboard'], multiplier: 1.5 }
    ];
    for (const rule of stationeryRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 文具价格上限（AUD）
    price = Math.min(price, 200);
  }

  if (category === '母婴') {
    const babyRules = [
      { keywords: ['婴儿车', 'stroller', 'pram'], multiplier: 2.5 },
      { keywords: ['婴儿床', 'baby cot', 'crib'], multiplier: 2.0 },
      { keywords: ['高椅', 'high chair'], multiplier: 1.5 },
      { keywords: ['安全座椅', 'car seat'], multiplier: 2.0 },
      { keywords: ['玩具', 'toys'], multiplier: 1.2 },
      { keywords: ['婴儿监视器', 'baby monitor'], multiplier: 1.8 },
      { keywords: ['吸奶器', 'breast pump'], multiplier: 1.5 },
      { keywords: ['背带', 'baby carrier'], multiplier: 1.3 },
      { keywords: ['尿布台', 'changing table'], multiplier: 1.4 }
    ];
    for (const rule of babyRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 母婴用品价格上限（AUD）
    price = Math.min(price, 400);
  }

  if (category === '美妆') {
    const beautyRules = [
      { keywords: ['化妆品', 'makeup'], multiplier: 1.2 },
      { keywords: ['护肤品', 'skincare'], multiplier: 1.3 },
      { keywords: ['香水', 'perfume'], multiplier: 2.0 },
      { keywords: ['吹风机', 'hair dryer'], multiplier: 1.5 },
      { keywords: ['卷发棒', 'curling iron'], multiplier: 1.3 },
      { keywords: ['化妆镜', 'makeup mirror'], multiplier: 1.2 },
      { keywords: ['指甲油', 'nail polish'], multiplier: 1.1 },
      { keywords: ['化妆刷', 'makeup brushes'], multiplier: 1.2 },
      { keywords: ['蒸脸器', 'facial steamer'], multiplier: 1.4 }
    ];
    for (const rule of beautyRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 美妆价格上限（AUD）
    price = Math.min(price, 150);
  }

  if (category === '乐器') {
    const instrumentRules = [
      { keywords: ['吉他', 'guitar'], multiplier: 1.8 },
      { keywords: ['钢琴', 'piano'], multiplier: 3.5 },
      { keywords: ['小提琴', 'violin'], multiplier: 2.5 },
      { keywords: ['鼓', 'drums'], multiplier: 2.0 },
      { keywords: ['键盘', 'keyboard'], multiplier: 1.8 },
      { keywords: ['萨克斯', 'saxophone'], multiplier: 2.2 },
      { keywords: ['小号', 'trumpet'], multiplier: 1.8 },
      { keywords: ['长笛', 'flute'], multiplier: 1.6 },
      { keywords: ['贝斯', 'bass guitar'], multiplier: 2.0 },
      { keywords: ['尤克里里', 'ukulele'], multiplier: 1.3 }
    ];
    for (const rule of instrumentRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 乐器价格上限（AUD）
    price = Math.min(price, 1500);
  }

  if (category === '图书') {
    const bookRules = [
      { keywords: ['教科书', 'textbook'], multiplier: 2.5 },
      { keywords: ['小说', 'novel'], multiplier: 1.2 },
      { keywords: ['烹饪书', 'cookbook'], multiplier: 1.5 },
      { keywords: ['儿童书', 'children book'], multiplier: 1.3 },
      { keywords: ['杂志', 'magazine'], multiplier: 1.1 },
      { keywords: ['漫画', 'comic'], multiplier: 1.4 },
      { keywords: ['字典', 'dictionary'], multiplier: 1.8 },
      { keywords: ['百科全书', 'encyclopedia'], multiplier: 2.0 },
      { keywords: ['艺术书', 'art book'], multiplier: 2.2 },
      { keywords: ['旅游指南', 'travel guide'], multiplier: 1.6 }
    ];
    for (const rule of bookRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 图书价格上限（AUD）
    price = Math.min(price, 80);
  }

  if (category === '宠物') {
    const petRules = [
      { keywords: ['狗笼', 'dog crate'], multiplier: 1.5 },
      { keywords: ['猫树', 'cat tree'], multiplier: 1.8 },
      { keywords: ['宠物笼', 'pet carrier'], multiplier: 1.3 },
      { keywords: ['宠物床', 'pet bed'], multiplier: 1.2 },
      { keywords: ['宠物玩具', 'pet toys'], multiplier: 1.1 },
      { keywords: ['鱼缸', 'aquarium'], multiplier: 2.0 },
      { keywords: ['鸟笼', 'bird cage'], multiplier: 1.4 },
      { keywords: ['宠物美容', 'pet grooming'], multiplier: 1.3 },
      { keywords: ['宠物训练', 'pet training'], multiplier: 1.2 }
    ];
    for (const rule of petRules) {
      if (rule.keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) {
        price = Math.round(price * OVERRIDE_MULTIPLIER);
        break;
      }
    }
    // 宠物用品价格上限（AUD）
    price = Math.min(price, 300);
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

// AI估价函数（使用多级AI服务）
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

    console.log('🤖 开始多级AI服务价格评估...');
    
    // 使用多级AI服务进行价格评估
    const aiResult = await estimatePriceWithAIServices(title, description, category);
    
        // 使用AI服务结果（已经与本地算法融合）
    const estimatedPrice = aiResult.estimatedPrice;
    const priceRange = getLocalPriceRange(category, estimatedPrice);
    
    // 在线比价（可选）
    try {
      const market = await getComparablePrices(`${title} ${category}`);
      if (market && market.success && market.medianPrice && market.currency === 'AUD') {
        // 与市场中位价做加权融合：市场0.6，融合结果0.4
        const finalPrice = Math.round(market.medianPrice * 0.6 + estimatedPrice * 0.4);
        return {
          success: true,
          estimatedPrice: finalPrice,
          priceRange: getLocalPriceRange(category, finalPrice),
          suggestions: [
            '基于AI智能分析的个性化建议',
            '建议在类似商品中比较价格',
            '考虑商品成色和市场需求'
          ],
          reasoning: `基于${category}类别的市场行情，${aiResult.source}分析；参考市场中位价$${market.medianPrice} (eBay AU)`,
          source: aiResult.source,
          aiAnalysis: {
            service: aiResult.aiService,
            confidence: aiResult.confidence,
            localPrice: aiResult.localPrice,
            aiMultiplier: aiResult.aiMultiplier
          }
        };
      }
    } catch (_) {}

    return {
      success: true,
      estimatedPrice: estimatedPrice,
      priceRange: priceRange,
      suggestions: [
        '基于AI智能分析的个性化建议',
        '建议在类似商品中比较价格',
        '考虑商品成色和市场需求'
      ],
      reasoning: `基于${category}类别的市场行情，${aiResult.source}分析`,
      source: aiResult.source,
      aiAnalysis: {
        service: aiResult.aiService,
        confidence: aiResult.confidence,
        localPrice: aiResult.localPrice,
        aiMultiplier: aiResult.aiMultiplier
      }
    };
  } catch (error) {
    console.error('AI估价错误:', error);
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

